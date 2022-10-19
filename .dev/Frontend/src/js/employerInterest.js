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
            contactPreferenceType: parseInt(sessionStorage.getItem("contact-pref")),
            contactName: sessionStorage.getItem("full-name"),
            additionalInformation: sessionStorage.getItem("information"),
            skillAreaIds: sessionStorage.getItem("skill-area").split(',').map(Number)
        };

        return req;
    }

    EmployerInterest.prototype.submitEmployerInterest = function (successHref) {
        //TODO: Change to POST when firewall allows it, use const for uri and data, method === "GET" block
        //const uri = findProviderApiUri + "employers/createinterest";

        let data = JSON.stringify(buildEoiRequestData());
        console.log("data=" + data);

        //const method = "POST";
        //workaround code using GET
        const method = "GET";
        const uri = findProviderApiUri + "employers/createinterest?data=" + CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));

        console.log("calling " + method + " " + uri);
        $.ajax({
            type: method,
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method);
            }
            //$.ajax({
            //    type: method,
            //    url: uri,
            //    data: data,
            //    contentType: "application/json",
            //    beforeSend: function (xhr) {
            //        addHmacAuthHeader(xhr, uri, findProviderAppId, findProviderApiKey, method, data);
            //    }
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
            //Show what?
        });
    }
};
