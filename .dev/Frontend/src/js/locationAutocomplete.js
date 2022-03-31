(function ($) {
    //Autocomplete for find provider search term

    // let findProvidersApiUrl = "{{ settings.find_provider_api_uri }}";    
    // if (findProvidersApiUrl.substr(-1) !== '/') findProvidersApiUrl += '/';
    let findProvidersApiUrl = "https://test.api.findatlevelprovider.education.gov.uk/api/v2/";
    console.log('autocomplete set ' + findProvidersApiUrl);
    
    const $keywordsInput = $('#tl-search-term');
    if ($keywordsInput.length > 0) {
        $keywordsInput.wrap('<div id="autocomplete-container" class="tl-autocomplete-wrap"></div>');
        var container = document.querySelector('#autocomplete-container');
        $(container).empty();
    }

    function getSuggestions(query, populateResults) {
        if (/\d/.test(query)) {
            console.log('has number - could be a postcode');
            return;
        }
        console.log('getting suggestions');
        var results = [];
        $.ajax({
            url: findProvidersApiUrl + "locations",
            type: "get",
            dataType: 'json',
            data: { searchTerm: query }
        }).done(function (data) {
            results = data.map(function (r) {
                return getLocationDisplayName(r);
            });
            console.log('populating autocomplete results');
            console.log(results);
            populateResults(results);
        });
    }

    function getLocationDisplayName(item) {
        if (item.county) {
            return item.name + ', ' + item.county;
        } else if (item.la) {
            return item.name + ', ' + item.la;
        }
        return item.name;
    }

    function onConfirm(confirmed) {
        console.log('confirmed: ' + confirmed);
        setTimeout(function () {
            $("#tl-search-providers").click();
        }, 200);
    }

    console.log('creating autocomplete');
    accessibleAutocomplete({
        element: container,
        id: 'tl-search-term',
        name: 'tl-search-term',
        displayMenu: 'overlay',
        showNoOptionsFound: false,
        minLength: 3,
        source: getSuggestions,
        placeholder: "Enter a postcode or town",
        onConfirm: onConfirm,
        confirmOnBlur: false,
        autoselect: true
    });
})(jQuery);
