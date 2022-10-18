function EmployerInterest(findProviderApiUri, findProviderAppId, findProviderApiKey) {

    if (typeof findProviderApiUri === "undefined" ||
        typeof findProviderAppId === "undefined" ||
        typeof findProviderApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProviderApiUri !== null && findProviderApiUri.substr(-1) !== '/') findProviderApiUri += '/';

    function buildEoiRequest() {
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
            routes: sessionStorage.getItem("skill-area").split(',').map(Number)
        };

        return req;
    }

    function submitEmployerInterest(successHref) {
        //This probably needs to be hooked up with the page - success will need to call back to setPage() to allow it to proceed to step 4
        
        console.log('submitting...');

        const uri = findProviderApiUri + "employers/createinterest";
        const method = "GET";
        //const method = "POST";
        
        const data = buildEoiRequest();
        console.log("calling " + uri);
        console.log(JSON.stringify(data));

        console.log('will redirect to ' + successHref);

        //TODO: call back end

        alert('will redirect to ' + successHref);
        window.location.href = successHref;
    }
};
