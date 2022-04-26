/* Find Provider */
console.log('in the find provider js file');

let isFapSearchInProgress = false;

$(document).ready(function () {

    let findProvidersApiUrl =
        $('script[data-findProviderApiUri][data-findProviderApiUri!=null]').attr('data-findProviderApiUri');
    let findProvidersAppId =
        $('script[data-findProviderAppId][data-findProviderAppId!=null]').attr('data-findProviderAppId');
    let findProvidersApiKey =
        $('script[data-findProviderApiKey][data-findProviderApiKey!=null]').attr('data-findProviderApiKey');

    if (typeof findProvidersApiUrl === "undefined" ||
        typeof findProvidersAppId === "undefined" ||
        typeof findProvidersApiKey === "undefined") {
        console.log('findProvider script requires data-findProviderApiUri, data-findProviderAppId and data-findProviderApiKey to be passed via the script tag');
        return;
    }

    if (findProvidersApiUrl !== null && findProvidersApiUrl.substr(-1) !== '/') findProvidersApiUrl += '/';

    console.log("findProvidersApiUrl = " + findProvidersApiUrl);
    console.log("findProvidersAppId = " + findProvidersAppId);
    console.log("findProvidersApiKey = " + findProvidersApiKey);

    let currentPage = 0;
    let currentSearchTerm = null;
    let currentSkillAreaIds = [];

    if ($("#tl-skill-area-filter").length) loadRoutes();

    const qualificationArticleMap = loadQualificationMap();

    //Check for search term query parameter
    let searchTerm = getUrlParameter("searchTerm");
    if (searchTerm) {
        searchTerm = urlDecode(searchTerm);
        //Remove query string from url
        const urlSplit = (window.location.href).split("?");
        const obj = { Title: document.title, Url: urlSplit[0] };
        history.pushState(obj, obj.Title, obj.Url);
        providerSearch(searchTerm);
    } else {
        $('.tl-fap--noresult').removeClass("tl-hidden");
    }

    $('#tl-search-term').keypress(function (e) {
        if (e.which === 13) {
            $("#tl-search-providers").click();
            return false;
        }
    });

    $("#tl-search-providers").click(function () {
        return providerSearch($("#tl-search-term").val().trim(), getSkillAreaIds());
    });

    $("#tl-update-search-providers").click(function () {
        return providerSearch($("#tl-search-term").val().trim(), getSkillAreaIds());
    });

    $(".tl-fap-search-providers-form").submit(function () {
        event.preventDefault();
    });

    $("#tl-next-results-link").click(function () {
        event.stopPropagation();
        event.preventDefault();
        callProviderSearchApi(currentSearchTerm, currentSkillAreaIds, currentPage + 1);
        return false;
    });

    function getSkillAreaIds() {
        const skillAreaIds = [];
        $('#tl-skill-area-filter .tl-checkbox:checked').each(
            function (_, item) {
                skillAreaIds.push(item.value);
            });

        return skillAreaIds;
    }

    function loadRoutes() {
        const uri = findProvidersApiUrl + "routes";
        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            populateRoutes(response);
        }).fail(function (error) {
            console.log('Call to get routes failed. ' + error);
        });
    }

    function populateRoutes(data) {
        const skillAreasList = $("#tl-skill-area-filter");
        skillAreasList.empty();

        $.each(data,
            function (_, item) {
                if (item.numberOfQualificationsOffered) {
                    skillAreasList.append(
                        $(document.createElement('div')).prop({
                            class: 'govuk-checkboxes__item'
                        }).append(
                            $(document.createElement('input')).prop({
                                id: 'tl_skill_area_' + item.id,
                                name: 'tl_skill_area_' + item.id,
                                value: item.id,
                                type: 'checkbox',
                                class: 'tl-checkbox govuk-checkboxes__input'
                            })).append(
                                $(document.createElement('label')).prop({
                                    for: 'tl_skill_area_' + item.id,
                                    class: 'govuk-body-s govuk-checkboxes__label'
                                })
                                    .html(item.name)
                            ));
                }
            });
    }

    function providerSearch(searchTerm, skillAreaIds, page) {
        clearProviderSearchResults();

//TODO: Remove this
if (searchTerm === "ERROR") {                
    showError("haha", "just joking");
    return false;
}        
        searchTerm = searchTerm ? searchTerm.trim() : "";
        if (searchTerm === "") {
            if (event) event.stopPropagation();
            showSearchTermError("Enter a postcode or town");
            return false;
        }

        if (!searchTerm.match(/^[0-9a-zA-Z,\.'\-!&\(\)/\s]+$/)) {
            if (event) event.stopPropagation();
            showSearchTermError("Enter a valid postcode or town");
            return false;
        }

        callProviderSearchApi(searchTerm, skillAreaIds, page);

        return true;
    }

    function callProviderSearchApi(searchTerm, skillAreaIds, page, pageSize) {
        if (isFapSearchInProgress) return false;
        isFapSearchInProgress = true;

        page = (page === undefined ? 0 : page);
        pageSize = (pageSize === undefined ? 5 : pageSize);

        const encodedSearchTerm = encodeURIComponent(searchTerm).replace(/'/g, '%27');
        let uri = findProvidersApiUrl + "providers?searchTerm=" + encodedSearchTerm + '&page=' + page + '&pageSize=' + pageSize;

        if (skillAreaIds && skillAreaIds.length > 0) {
            skillAreaIds.forEach(function (skillAreaId) {
                uri += "&routeId=" + skillAreaId;
            });
        }

        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            if (response.error) {
                console.log("Invalid providers search response received - " + response.error);
                showSearchTermError("Enter a valid postcode or town");
            } else {
                currentPage = page;
                currentSearchTerm = searchTerm;
                currentSkillAreaIds = skillAreaIds;
                populateProviderSearchResults(response);
            }
            setTimeout(function () {
                //delay to avoid autocomplete suggestions loading
                isFapSearchInProgress = false;
            }, 200);
        }).fail(function (jqxhr) {
            showError(jqxhr.status, jqxhr.responseText);
            isFapSearchInProgress = false;
        });

        return true;
    }

    // function loadQualificationMap() {
    //     const map = {};
    //     map[36] = "{{ settings.qualification_article_36 }}";
    //     map[37] = "{{ settings.qualification_article_37 }}";
    //     map[38] = "{{ settings.qualification_article_38 }}";
    //     map[39] = "{{ settings.qualification_article_39 }}";
    //     map[40] = "{{ settings.qualification_article_40 }}";
    //     map[41] = "{{ settings.qualification_article_41 }}";
    //     map[42] = "{{ settings.qualification_article_42 }}";
    //     map[43] = "{{ settings.qualification_article_43 }}";
    //     map[44] = "{{ settings.qualification_article_44 }}";
    //     map[45] = "{{ settings.qualification_article_45 }}";
    //     map[46] = "{{ settings.qualification_article_46 }}";
    //     map[47] = "{{ settings.qualification_article_47 }}";
    //     map[48] = "{{ settings.qualification_article_48 }}";
    //     map[49] = "{{ settings.qualification_article_49 }}";
    //     map[50] = "{{ settings.qualification_article_50 }}";
    //     map[51] = "{{ settings.qualification_article_51 }}";
    //     return map;
    // }

    function clearProviderSearchResults() {
        $('#tl-error').addClass("tl-hidden");
        $('#tl-search-term-error').addClass("tl-hidden");
        $('.tl-fap--noresult').addClass("tl-hidden");
        $("#tl-next-results-link").addClass("tl-hidden");
        $("#tl-fap--results").find(".tl-fap--result").remove();
        currentPage = 0;
    }

    function populateProviderSearchResults(data) {
        if (data.searchTerm && data.searchTerm !== $("#tl-search-term").val()) {
            $("#tl-search-term").val(data.searchTerm);
        }

        if (!data.searchResults || data.searchResults.length === 0) {
            $('.tl-fap--noresult').removeClass("tl-hidden");
            return;
        }

        $.each(data.searchResults,
            function (_, providerLocation) {
                let searchResult =
                    '<div class="tl-fap--result"> \
                             <h3 class="govuk-heading-m">' + providerLocation.providerName + ' <span class="tl-fap--distance">' + providerLocation.distance.toFixed(0) + ' miles</span></h3> \
                             <p class="govuk-body"><span>' + providerLocation.town + '</span> | ' + providerLocation.postcode + '</p>';

                if (providerLocation.telephone || providerLocation.website || providerLocation.email) {
                    let contactDetails = providerLocation.telephone
                        ? 'Telephone: <strong>' + providerLocation.telephone + '</strong>'
                        : "";
                    if (providerLocation.website) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += '<a target="_blank" href="' + providerLocation.website + '" class="govuk-link tl-fap--result-website">Visit <span class="govuk-visually-hidden">' + providerLocation.providerName + '</span> website</a>';
                    }
                    if (providerLocation.email) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += 'Email: <a href="mailto:' + providerLocation.email + '" class="govuk-link govuk-!-margin-right-4 tl-fap--result-email">' + providerLocation.email + '</a>';
                    }
                    searchResult += '<p class="govuk-body">' + contactDetails + '</p>';
                }

                const locationDeliveryYears = [];
                let availableNow = null;
                $.each(providerLocation.deliveryYears,
                    function (_, deliveryYear) {
                        if (deliveryYear.isAvailableNow) {
                            if (availableNow) {
                                for (let i = 0; i < deliveryYear.qualifications.length; i++) {
                                    if (availableNow.qualifications.filter(function (q) { return q.name === deliveryYear.qualifications[i].name; }).length === 0)
                                        availableNow.qualifications.push(deliveryYear.qualifications[i]);
                                }
                            } else {
                                availableNow = deliveryYear;
                                locationDeliveryYears.push(availableNow);
                            }
                        } else {
                            locationDeliveryYears.push(deliveryYear);
                        }
                    });

                if (availableNow) {
                    availableNow.qualifications.sort(function (x, y) { return (x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0) });
                }

                searchResult += '</p><div class="tl-fap--courses">';

                $.each(locationDeliveryYears,
                    function (_, deliveryYear) {
                        const availability = deliveryYear.isAvailableNow
                            ? 'Available now'
                            : 'From September ' + deliveryYear.year + ' onwards';

                        searchResult += '<p class="govuk-body govuk-!-font-weight-bold">' + availability + ':</p> \
                                    <ul class="govuk-list govuk-list--bullet">';

                        $.each(deliveryYear.qualifications,
                            function (_, qualification) {
                                const articleLink = qualificationArticleMap[qualification.id];
                                if (articleLink) {
                                    searchResult += '<li><a target="_blank" class="govuk-link tl-fap--result-course" href="' + articleLink + '">' + qualification.name + '</a></li>';
                                } else {
                                    searchResult += '<li>' + qualification.name + '</li>';
                                }
                            });

                        searchResult += '</ul>';
                    });

                searchResult += '</div> \
                                    <hr class="govuk-section-break govuk-section-break--xl govuk-section-break--visible"> \
                                  </div>';

                $("#tl-fap--results").append(searchResult);
            });

        $('#tl-next-results-link').removeClass("tl-hidden");
    }

    function showError(status, errorText) {
        console.log("Error status " + status + " was encountered. " + errorText);
        switch (status) {
            case 0:
                $("#tl-error-header").text('There is a problem with your network connection.');
                $("#tl-error-detail").html('There is a problem with your network connection. Check you’re connected to the internet and try again.');
                break;
            default:
                $("#tl-error-header").text('Sorry, there is a problem with the service.');
                $("#tl-error-detail").html('Try again later or <a class="govuk-link tl-error--contact" href="https://test.employers.tlevels.gov.uk/hc/en-gb/requests/new">contact us</a> quoting error code ' + status);
        }

        clearProviderSearchResults();
        $('#tl-error').removeClass("tl-hidden");
    }

    function showSearchTermError(message) {
        $("#tl-search-term-error").text(message);
        $('#tl-search-term-error').removeClass("tl-hidden");
        $('#tl-error').addClass("tl-hidden");
        $('.tl-fap--noresult').removeClass("tl-hidden");
    }

    function addHmacAuthHeader(xhr, uri, appId, apiKey) {
        const ts = Math.round((new Date()).getTime() / 1000);
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        const nonce = CryptoJS.enc.Hex.parse(uuid);
        const data = appId + "GET" + uri.toLowerCase() + ts + nonce;

        const hash = CryptoJS.HmacSHA256(data, apiKey);
        const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

        xhr.setRequestHeader("Authorization", "amx " + appId + ":" + hashInBase64 + ":" + nonce + ":" + ts);
    }

    function urlDecode(str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    }

    function getUrlParameter(key, url) {
        if (!url) {
            url = window.location.search.substring(1);
        }
        const urlVars = url.split('&');
        for (let i = 0; i < urlVars.length; i++) {
            const parameter = urlVars[i].split('=');
            if (parameter[0] === key) {
                return parameter[1];
            }
        }

        return null;
    }

});
