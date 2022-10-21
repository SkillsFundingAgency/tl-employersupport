function FindProviderTile(findProviderRedirectUrl, findProviderApiUri, findProviderAppId, findProviderApiKey) {
    // Find Provider tile
    const fapTileContainer = $(".tl-fap-tile--home").first();
    if (!fapTileContainer.length) return;
    
    if (typeof findProviderRedirectUrl === "undefined" ||
        typeof findProviderApiUri === "undefined"||
        typeof findProviderAppId === "undefined" ||
        typeof findProviderApiKey === "undefined") {
        console.log('findProviderTile script requires findProviderApiUri, findProviderAppId, findProviderApiKey and findProvidersRedirectUrl parameters');
        return;
    }

    if (findProviderApiUri !== null && findProviderApiUri.substr(-1) !== '/') findProviderApiUri += '/';
    
    //Only works on first fap tile - we are assuming there is only one
    fapTileContainer.empty();
    fapTileContainer.append(
        '<div class="govuk-grid-row govuk-!-margin-top-2 tl-fap-home--container"> \
            <div class="govuk-grid-column-full"> \
                <div class="tl-card--fap--home"> \
                    <h2 class="govuk-!-margin-top-2 govuk-!-margin-bottom-4 govuk-heading-l">Partner with a school or college</h2> \
                    <div class="govuk-grid-row tl-row-fill--fixed tl-card-fap--wrap"> \
                        <div class="govuk-grid-column-one-half tl-row-fill--fixed tl-order-mobile--1"> \
                            <div class="tl-card--fap--home--white"> \
                                <form role="search" class="tl-fap-search-providers-form"> \
                                    <h3 class="govuk-heading-m govuk-!-margin-bottom-1">Search for providers</h3> \
                                    <p class="govuk-body">See schools and colleges near you.</p> \
                                    <span class="govuk-error-message tl-hidden" id="tl-search-term-error">You must enter a postcode or town</span> \
                                    <label class="govuk-visually-hidden" for="tl-search-term">Postcode or town</label> \
                                    <input class="govuk-input govuk-input--width-10 tl-fap-home--input" id="tl-search-term" name="tl-search-term" type="text" placeholder="Enter postcode or town"> \
                                    <button class="govuk-button tl-button--blue tl-fap-home--submit govuk-!-margin-bottom-0" id="tl-search-providers" data-module="govuk-button"> \
                                        Search \
                                    </button> \
                                </form> \
                            </div> \
                        </div> \
                        <div class="govuk-grid-column-one-half tl-row-fill--fixed tl-order-mobile--3"> \
                            <div class="tl-card--fap--home--white"> \
                                <h3 class="govuk-heading-m govuk-!-margin-bottom-1">Invite providers to contact you</h3> \
                                <p class="govuk-body">Leave your details for them to get in touch.</p> \
                                <a class="govuk-button tl-button--blue govuk-!-margin-bottom-0 govuk-!-margin-top-1" id="tl-eoi-button--home" href="/hc/en-gb/articles/8050093018258">Register your interest</a> \
                            </div> \
                        </div> \
                        <div class="govuk-grid-column-full tl-row-fill--fixed tl-order-mobile--2"> \
                            <div class="tl-card--fap--left tl-card--fap--linkcontainer govuk-!-padding-left-0 govuk-!-margin-top-5"> \
                                <details class="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details"> \
                                    <summary class="govuk-details__summary"> \
                                        <span class="govuk-details__summary-text"> \
                                            Looking for providers in more than one location? \
                                        </span> \
                                    </summary> \
                                    <div class="govuk-details__text"> \
                                        <p class="govuk-body">You can download a list of all T Level providers if you need to see schools and colleges in multiple locations.</p> \
                                        <p class="govuk-body"> \
                                            <a href="#" class="govuk-link tl-provider-csv">All T Level providers <span class="tl-provider-csv-date"></span></a> \
                                            <br />CSV, <span class="tl-provider-csv-size tl-hidden"></span> \
                                        </p> \
                                        <p class="govuk-body"><strong>Note:</strong> This file contains publicly available data provided by the schools and colleges listed.</p> \
                                    </div> \
                                </details> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </div>');

    //initialize autocomplete and file download
    new LocationAutocomplete(findProviderApiUri);
    new FindProviderDownload(findProviderApiUri, findProviderAppId, findProviderApiKey);

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

    $(".tl-article--content .govuk-details__summary").click(function () {
        if (this.closest(".govuk-details").hasAttribute("open")) {
            $(this).closest(".govuk-details").removeAttr('open');
        }
        else {
            $(this).closest(".govuk-details").attr('open', true);
        }
    });
};
