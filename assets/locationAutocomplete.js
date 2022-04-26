(function ($) {
    //Autocomplete for find provider search term
    const $keywordsInput = $('#tl-search-term');
    if (!$keywordsInput.length) return;

    let findProvidersApiUrl =
        $('script[data-findProviderApiUri][data-findProviderApiUri!=null]').attr('data-findProviderApiUri');

    if (typeof findProvidersApiUrl === 'undefined') {
        console.log('autocomplete script requires data-findProviderApiUri to be passed via the script tag');
        return;
    }

    if (findProvidersApiUrl !== null && findProvidersApiUrl.substr(-1) !== '/') findProvidersApiUrl += '/';

    $keywordsInput.wrap('<div id="autocomplete-container" class="tl-autocomplete-wrap"></div>');
    const container = document.querySelector('#autocomplete-container');
    $(container).empty();

    function getSuggestions(query, populateResults) {
        if ((typeof isFapSearchInProgress !== 'undefined' && isFapSearchInProgress)
            || /\d/.test(query)) {
            return;
        }
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
            populateResults(results);
        });
    }

    function getLocationDisplayName(item) {
        if (item.county) return item.name + ', ' + item.county;
        else if (item.la) return item.name + ', ' + item.la;
        return item.name;
    }

    function onConfirm(confirmed) {
    }

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
