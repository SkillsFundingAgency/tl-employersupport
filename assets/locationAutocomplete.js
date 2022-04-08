(function ($) {
    //Autocomplete for find provider search term

    const $keywordsInput = $('#tl-search-term');
    if ($keywordsInput.length > 0) {
        $keywordsInput.wrap('<div id="autocomplete-container" class="tl-autocomplete-wrap"></div>');
        var container = document.querySelector('#autocomplete-container');
        $(container).empty();
    }

    function getSuggestions(query, populateResults) {
        if ((typeof isSearchInProgress !== 'undefined' && isSearchInProgress)
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
