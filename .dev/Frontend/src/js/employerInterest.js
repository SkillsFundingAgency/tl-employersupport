function EmployerInterest(findProviderApiUri, findProviderAppId, findProviderApiKey) {

    if (typeof findProviderApiUri === "undefined" ||
        typeof findProviderAppId === "undefined" ||
        typeof findProviderApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProviderApiUri !== null && findProviderApiUri.substr(-1) !== '/') findProviderApiUri += '/';

    //TODO: Remove this logging
    console.log('findProviderApiUri: ' + findProviderApiUri);
    console.log('findProviderAppId: ' + findProviderAppId);
    console.log('findProviderApiKey: ' + findProviderApiKey);

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

    function submitEmployerInterest() {
        //This probably needs to be hooked up with the page - success will need to call back to setPage() to allow it to proceed to step 4
        
        console.log('submitting...');

        const uri = findProviderApiUri + "employers/createinterest";
        //TODO: 
        const method = "GET";
        //const method = "POST";
        
        const data = buildEoiRequest();
        console.log("calling " + uri);
        console.log(JSON.stringify(data));

        //TODO: call back end

    }

};
