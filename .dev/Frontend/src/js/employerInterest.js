function EmployerInterest(findProviderApiUri, findProviderAppId, findProviderApiKey) {

    if (typeof findProviderApiUri === "undefined" ||
        typeof findProviderAppId === "undefined" ||
        typeof findProviderApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProviderApiUri !== null && findProviderApiUri.substr(-1) !== '/') findProviderApiUri += '/';

    function buildEoiRequestData() {
        //encode so it will go through the firewall
        let website = sessionStorage.getItem("website");
        if(website) website = website.replace(/(http[s]?):\/\//gi, '$1___');
        let information = sessionStorage.getItem("information");
        if(information) information = information.replace(/(http[s]?):\/\//gi, '$1___');

        let req = {
            organisationName: sessionStorage.getItem("organisation-name"),
            industryId: parseInt(sessionStorage.getItem("industry")) || 0,
            otherIndustry: sessionStorage.getItem("industry-other"),
            postcode: sessionStorage.getItem("postcode"),
            email: sessionStorage.getItem("email"),
            telephone: sessionStorage.getItem("telephone"),
            website: website,
            contactPreferenceType: parseInt(sessionStorage.getItem("contact-pref")),
            contactName: sessionStorage.getItem("full-name"),
            additionalInformation: information,
            skillAreaIds: sessionStorage.getItem("skill-area").split(',').map(Number)
        };

        return req;
    }

    EmployerInterest.prototype.validatePostcode = function(postcode, successCallback, errorCallback) {
        console.log('validatePostcode called for ' + postcode);
        if (postcode === 'undefined' || !postcode) {
            //No need to validate missing postcode - this is done elsewhere
            if(errorCallback !== 'undefined') errorCallback();
        }

        const method = "GET";
        const uri = findProviderApiUri + "locations/validate?postcode=" + encodeURIComponent(postcode);
        $.ajax({
            type: method,
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method);
            }
        }).done(function (data, status, xhr) {
            console.log('postcode validated');
            console.log('xhr.status = ' + xhr.status);
            if(successCallback !== 'undefined') successCallback();
        }).fail(function (xhr, status, error) {
            if(xhr.status === 404) {
                console.log('validate postcode returned 404 - not found');
                if(errorCallback !== 'undefined') errorCallback(); 
            }
            else {
                console.log('Call to validate postcode failed. ' + status + ' ' + error);
                console.log('xhr.status = ' + xhr.status);
                if(errorCallback !== 'undefined') errorCallback(); 
            }
        });        
    }

    EmployerInterest.prototype.submitEmployerInterest = function(successCallback, errorCallback) {
        let data = JSON.stringify(buildEoiRequestData());

        const method = "POST";
        const uri = findProviderApiUri + "employers/createinterest";        
        $.ajax({
            type: method,
            url: uri,
               data: data,
               contentType: "application/json",
               beforeSend: function (xhr) {
                   addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method, data);
               }
        }).done(function (response) {
            console.log('Successfully submitted eoi data.');
            console.log(response);
            successCallback();
        }).fail(function (xhr, status, error) {
            console.log('Call to create employer interest failed. ' + status + ' ' + error);
            console.log('error = ' + error);
            console.log('status = ' + status);
            console.log('xhr.status = ' + xhr.status);
            if(errorCallback !== 'undefined') errorCallback(); 
        });
    }

    EmployerInterest.prototype.removeEmployerInterest = function(employerId, successCallback) {
        console.log('removeEmployerInterest called for ' + employerId);
        if (employerId === 'undefined' || !employerId) {
            successCallback();
            return;
        }

        const method = "DELETE";
        const uri = findProviderApiUri + "employers/deleteinterest/" + employerId;
        $.ajax({
            type: method,
            url: uri,
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method);
            }
        }).done(function (data, status, xhr) {
            console.log('delete employer interest succeeded');
            console.log('data = ' + data);
            console.log('xhr.status = ' + xhr.status);
            successCallback();
        }).fail(function (xhr, status, error) {
            if(xhr.status === 404) {
                console.log('delete employer interest returned 404 - no employer interest found');
                successCallback(); //404 means nothing found to delete, because it's already gone
            }
            else {
                console.log('Call to delete employer interest failed. ' + status + ' ' + error);
                console.log('error = ' + error);
                console.log('status = ' + status);
                console.log('xhr.status = ' + xhr.status);
            }
        });        
    }
};


function setpage(eoi) {
    var step = getUrlParameter('step');

    if (step == 1) {
        $("#tl-eoi--1").removeClass("tl-hidden");
        $(".tl-backlink").attr("href", "?step=0");
    }

    else if (step == 2) {
        session = checkSessionStorage(2);
        if (session == true) {
            $("#tl-eoi--2").removeClass("tl-hidden");
            $(".tl-backlink").attr("href", "?step=1");
        }

        else {
            $("#tl-eoi--start").removeClass("tl-hidden");
            $("#tl-eoi--related").removeClass("tl-hidden");
            $(".tl-breadcrumbs").removeClass("tl-hidden");
            $(".tl-backlink").addClass("tl-hidden");        }
    }

    else if (step == 3) {
        session = checkSessionStorage(3);
        if (session == true) {
            $("#tl-eoi--3").removeClass("tl-hidden");
            $(".tl-backlink").attr("href", "?step=2");
        }

        else {
            $("#tl-eoi--start").removeClass("tl-hidden");
            $("#tl-eoi--related").removeClass("tl-hidden");
            $(".tl-breadcrumbs").removeClass("tl-hidden");
            $(".tl-backlink").addClass("tl-hidden");
        }
    }

    else if (step == 4) {
        $("#tl-eoi--4").removeClass("tl-hidden");
        $("#tl-breadcrumbs").addClass("tl-hidden");
        $(".tl-backlink").addClass("tl-hidden");
        sessionStorage.clear();
    }

    else if (step == "error") {
        $("#tl-eoi--error").removeClass("tl-hidden");
        $("#tl-breadcrumbs").addClass("tl-hidden");
        $(".tl-backlink").addClass("tl-hidden");
        sessionStorage.clear();
    }

    else if (step == "withdraw") {
        var employerId = getUrlParameter('id');
        eoi.removeEmployerInterest(employerId, 
            function() {
                $("#tl-eoi--withdraw").removeClass("tl-hidden");
                $("#tl-breadcrumbs").addClass("tl-hidden");
                $(".tl-backlink").addClass("tl-hidden");
                document.title = 'You have withdrawn your interest | T Levels and industry placement support for employers';
        });
    }

    else {
        $("#tl-eoi--start").removeClass("tl-hidden");
        $("#tl-eoi--related").removeClass("tl-hidden");
        $(".tl-breadcrumbs").removeClass("tl-hidden");
        $(".tl-backlink").addClass("tl-hidden");
    }
}

function telephoneexpand() {
    var inputlength = $("input[name=telephone]").val().length;
    $("#tl-eoi-contactpref").toggleClass('tl-hidden', inputlength == 0);
    if (inputlength == 0) {
        $("#tl-eoi-contactpref input").prop("checked", false);
    }
}

function storeanswers() {
    $(".tl-eoi-form input[type='text'], .tl-eoi-form input[type='email'], .tl-eoi-form input[type='tel']").each(function () {
        var value = $(this).val();
        var name = $(this).attr("name");
        if (value == "") {
            sessionStorage.removeItem(name)
        }
        else {
            sessionStorage.setItem(name, value)
        }
    });

    $(".tl-eoi-form textarea").each(function () {
        var value = $(this).val();
        var name = $(this).attr("name");
        if (value == "") {
            sessionStorage.removeItem(name)
        }
        else {
            sessionStorage.setItem(name, value)
        }
    });

    /*Store data value for skill areas */
    $(".govuk-radios, .govuk-checkboxes").each(function () {
        let selection = [];
        let name = $(this).attr("data-name");
        $(this).find("input:checked").each(function () {
            selection.push($(this).attr("data-id"));
        });
        if (selection.length === 0) {
            sessionStorage.removeItem(name)
        }
        else {
            sessionStorage.setItem(name, selection)
        }
    });
};

function populateanswers() {
    $(".tl-eoi-checkanswers .govuk-summary-list__value").each(function () {
        let checkname = $(this).attr("data-name");
        let checkval = $(".tl-eoi-form input[name='" + checkname + "'][type='text'], .tl-eoi-form input[name='" + checkname + "'][type='email'], .tl-eoi-form input[name='" + checkname + "'][type='tel'], .tl-eoi-form input[name='" + checkname + "'][type='radio']:checked, .tl-eoi-form input[name='" + checkname + "'][type='checkbox']:checked, .tl-eoi-form textarea[name='" + checkname + "']");
        let checkvalues = []
        checkval.each(function () {
            if ($(this).val() == "Other") {
                let othername = checkname + "-other"
                let otherval = $(".tl-eoi-form input[name='" + othername + "']");
                checkvalues.push(otherval.val());
            }

            else {
                checkvalues.push($(this).val());
            }
        })
        let checkoutput = checkvalues.join('|');
        $(this).html(checkoutput);
    });

    $('#tl-eoi-check--skill-area').html(function (index, html) {
        return html.replace(/\|/g, "<br>");
    });
};

function populatefields() {
    $(".tl-eoi-form input[type='text'], .tl-eoi-form textarea, .tl-eoi-form input[type='email'], .tl-eoi-form input[type='tel']").each(function () {
        var checkname = $(this).attr("name");
        var sessionval = sessionStorage.getItem(checkname)
        $(this).val(sessionval);
        telephoneexpand()
    });

    $(".tl-eoi-form input[type='radio'], .tl-eoi-form input[type='checkbox']").each(function () {
        var checkname = $(this).attr("name");
        var datavalue = $(this).val();
        var dataid = $(this).attr("data-id");

        var sessionval = sessionStorage.getItem(checkname)
        if (sessionval != null) {
            if (sessionval.indexOf(datavalue) > -1 || sessionval.indexOf(dataid) > -1) {
                $(this).prop('checked', true);
                $(this).parent().next(".govuk-radios__conditional").toggleClass("govuk-radios__conditional--hidden");
                $(this).parent().next(".govuk-checkboxes__conditional").toggleClass("govuk-checkboxes__conditional--hidden");
            }
        }
    });
}

function validateanswers(successCallback) {
    clearErrors()
    let haserror = false;
    var step = getUrlParameter('step');
    if (step == 1) {
        // Name val //
        let fullname = $("#full-name");
        if (fullname.val().length == 0) {
            addError("Enter your full name", fullname);
            haserror = true;
        }
        // Email val //
        let email = $("#email");
        var emailreg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailreg.test(email.val())) {
            addError("Enter an email address in the correct format, for example name@example.com", email);
            haserror = true;
        }
        if (email.val().length == 0) {
            addError("Enter your email address", email);
            haserror = true;
        }

        // Tel val //
        let tel = $("#telephone");
        var telreg = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
        if (tel.val().length != 0 && !telreg.test(tel.val())) {
            addError("Enter a telephone number in the correct format, for example 01632960001 or 07700900982", tel);
            haserror = true;
        }

        // Contact pref val //
        let contactpref = $("#tl-eoi-contactpref input");
        let contactprefchecked = $("#tl-eoi-contactpref input:checked");
        if (tel.val().length != 0 && contactprefchecked.length == 0) {
            addError("Select how you'd prefer to be contacted", contactpref);
            haserror = true;
        }
    }

    if (step == 2) {
        // Orgname val //
        let orgname = $("#organisation-name");
        if (orgname.val().length == 0) {
            addError("Enter your organisation name", orgname);
            haserror = true;
        }

        // Orgname val //
        let industry = $("#tl-eoi-industry input");
        let industrychecked = $("#tl-eoi-industry input:checked");
        if (industrychecked.length == 0) {
            addError("Select your organisation's primary industry", industry);
            haserror = true;
        }
        let industryother = $("#industry-other")
        if (industrychecked.val() == "Other" && industryother.val().length == 0) {
            addError("Enter an alternative primary industry", industryother);
            haserror = true;
        }

        // Skillarea val //
        let skillarea = $("#tl-eoi-skillarea input");
        let skillareachecked = $("#tl-eoi-skillarea input:checked:last");
        if (skillareachecked.length == 0) {
            addError("Select at least one skill area you'd be interested in hosting an industry placement in", skillarea);
            haserror = true;
        }

        // Postcode val //
        let postcode = $("#postcode");
        var postcodereg = /^(([A-Z]{1,2}[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?[0-9][A-Z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Z]{2} ?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/i;
        if (!postcodereg.test(postcode.val().trim())) {
            addError("Enter a real UK postcode, for example SW1A 1AA", postcode);
            haserror = true;
        }
        if (postcode.val().length == 0) {
            addError("Enter your organisation's postcode", postcode);
            haserror = true;
        }

        // More info val //
        let moreinfo = $("#information");
        if (moreinfo.val().length > 1000) {
            addError("Enter 1000 characters or less", moreinfo);
            haserror = true;
        }
    }

    if (step == 3) {
        // Orgname val //
        let consentcheck = $("#tl-consent-check");
        if (!consentcheck.is(':checked')) {
            addError("Select the box to confirm that you consent to the Department for Education processing and storing your data for the purposes described in the privacy notice", consentcheck);
            haserror = true;
        }
    }

    if(!haserror)
    {
        //TODO: validate postcode last
        if (step == 2) {
            var postcode = $("#postcode");
            eoi.validatePostcode(postcode.val(), successCallback, function() {                
                addError("Enter a real UK postcode, for example SW1A 1AA", postcode);
                haserror = true;  
            });
        }
        else
        {
            successCallback();
        }
    }
    return haserror;
}

function addError(errortext, element) {
    var preerror = '<span class="govuk-visually-hidden">Error: </span>'
    element.closest(".govuk-form-group").addClass("govuk-form-group--error");
    element.closest(".govuk-form-group").find(".govuk-error-message").first().removeClass("tl-hidden");
    element.closest(".govuk-form-group").find(".govuk-error-message").first().html(preerror + errortext);
    element.first().addClass("govuk-input--error");
}

function clearErrors() {
    $(".govuk-form-group").removeClass("govuk-form-group--error");
    $(".govuk-error-message").addClass("tl-hidden");
    $(".govuk-error-message").html("");
    $(".govuk-input--error").removeClass("govuk-input--error");
}

function checkSessionStorage(stage) {
    let storagestate = false;
    if (stage === 2) {
        if ((sessionStorage.getItem("full-name") != null) && (sessionStorage.getItem("email") != null)) {
            storagestate = true;
            console.log("stage 2 - true")
        }
    }
    if (stage === 3) {
        if ((sessionStorage.getItem("full-name") != null) && (sessionStorage.getItem("email") != null) && (sessionStorage.getItem("postcode") != null) && (sessionStorage.getItem("organisation-name") != null) && (sessionStorage.getItem("industry") != null) && (sessionStorage.getItem("skill-area") != null)) {
            storagestate = true;
            console.log("stage 3 - true")
        }
    }
    return storagestate;
}
