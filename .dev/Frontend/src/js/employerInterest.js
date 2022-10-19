function EmployerInterest(findProviderApiUri, findProviderAppId, findProviderApiKey) {

    if (typeof findProviderApiUri === "undefined" ||
        typeof findProviderAppId === "undefined" ||
        typeof findProviderApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProviderApiUri !== null && findProviderApiUri.substr(-1) !== '/') findProviderApiUri += '/';

    function buildEoiRequestData() {
        let req = {
            organisationName: sessionStorage.getItem("organisation-name"),
            industryId: parseInt(sessionStorage.getItem("industry")) || 0,
            otherIndustry: sessionStorage.getItem("industry-other"),
            postcode: sessionStorage.getItem("postcode"),
            email: sessionStorage.getItem("email"),
            telephone: sessionStorage.getItem("telephone"),
            website: sessionStorage.getItem("website"),
            contactPreferenceType: sessionStorage.getItem("contact-pref"),
            contactName: sessionStorage.getItem("full-name"),
            additionalInformation: sessionStorage.getItem("information"),
            skillAreaIds: sessionStorage.getItem("skill-area").split(',').map(Number)
        };

        return req;
    }

    EmployerInterest.prototype.submitEmployerInterest = function (successHref) {

        loadRoutes();

        const uri = findProviderApiUri + "employers/createinterest";
        const method = "GET";
        
        const data = JSON.stringify(buildEoiRequestData());
        console.log("calling " + method + " " + uri);
        console.log(data);

        $.ajax({
            type: method,
            url: uri,
            data: JSON.stringify(data),
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method, data);
            }
        }).done(function (response) {
            console.log('Successfully submitted eoi data.');
            console.log(response);
            console.log('will redirect to ' + successHref);
            alert('success!');
            window.location.href = successHref;
        }).fail(function (xhr, status, error) {
            console.log('Call to create employer interest failed. ' + status + ' ' + error);
            console.log('error = ' + error);
            console.log('status = ' + status);
            console.log('xhr.status = ' + xhr.status);
            alert('fail!');
            //Show what?
        });
    }

    function loadRoutes() {
        const uri = findProviderApiUri + "routes";
        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey);
            }
        }).done(function (response) {
            console.log('got routes');
            console.log(response);
        }).fail(function (error) {
            console.log('Call to get routes failed. ' + error);
        });
    }
};
