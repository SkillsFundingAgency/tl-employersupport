function FindProviderTile() {
    // Find Provider tile
    const fapTileContainer = $(".tl-fap-tile").first();
    if (!fapTileContainer.length) return;

    let findProviderRedirectUrl =
        $('script[data-findProviderRedirectUrl][data-findProviderRedirectUrl!=null]').attr('data-findProviderRedirectUrl');
    let findProvidersApiUri = 
        $('script[data-findProviderApiUri][data-findProviderApiUri!=null]').attr('data-findProviderApiUri');
    
    if (typeof findProviderRedirectUrl === "undefined" ||
        typeof findProvidersApiUri === "undefined") {
        console.log('findProviderTile script requires data-findProviderApiUri and data-findProviderRedirectUrl to be passed via the script tag');
        return;
    }

    if (findProvidersApiUri !== null && findProvidersApiUri.substr(-1) !== '/') findProvidersApiUri += '/';
    
    //Only works on first fap tile - we are assuming there is only one
    fapTileContainer.empty();
    fapTileContainer.append(
        '<div class="govuk-grid-row govuk-!-margin-top-7 tl-fap-home--container"> \
            <div class="govuk-grid-column-full"> \
                <div class="tl-card--fap"> \
                    <div class="tl-card--fap--left"> \
                        <h2 class="govuk-!-margin-top-2 govuk-!-margin-bottom-4">Partner with a school or college</h2> \
                        <p class="govuk-body">Offer a placement or find out more about their T Level programme.</p> \
                    </div> \
                    <div class="tl-card--fap--right"> \
                        <form role="search" class="tl-fap-search-providers-form"> \
                            <span class="govuk-error-message tl-hidden" id="tl-search-term-error">You must enter a postcode or town</span> \
                            <label class="govuk-visually-hidden" for="tl-search-term">Enter postcode or town</label> \
                            <input class="govuk-input govuk-input--width-10 tl-fap-home--input" id="tl-search-term" name="tl-search-term" type="text" placeholder="Enter postcode or town"> \
                            <button class="govuk-button tl-button--blue tl-fap-home--submit govuk-!-margin-bottom-0" id="tl-search-providers" data-module="govuk-button"> \
                                Search \
                            </button> \
                        </form> \
                    </div> \
                </div> \
            </div> \
        </div>');

    //initialize autocomplete
    new LocationAutocomplete(findProvidersApiUri);

    $('#tl-search-term').val("");

    $('#tl-search-term').keypress(function(e) {
        if (e.which === 13) {
            $("#tl-search-providers").click();
            return false;
        }
    });

    $("#tl-search-providers").click(function() {
        const searchTerm = $("#tl-search-term").val().trim();

        if (searchTerm === "") {
            event.stopPropagation();
            showSearchTermError("Enter postcode or town");
            return false;
        }

        $(location).attr('href', findProviderRedirectUrl + '?searchTerm=' + encodeURIComponent(searchTerm));

        return true;
    });

    $(".tl-fap-search-providers-form").submit(function() {
        event.preventDefault();
    });

    function showSearchTermError(message) {
        if (!$("#tl-search-term-error").length) return;
        $("#tl-search-term-error").text(message);
        $('#tl-search-term-error').removeClass("tl-hidden");
    }
};
