$(document).ready(function () {
    // Find Provider tile

    if (!$('#tl-search-term').length) return;

    let findProviderRedirectUrl =
        $('script[data-findProviderRedirectUrl][data-findProviderRedirectUrl!=null]').attr('data-findProviderRedirectUrl');
    let findProvidersApiUrl = 
        $('script[data-findProviderApiUri][data-findProviderApiUri!=null]').attr('data-findProviderApiUri');
    
    if (typeof findProviderRedirectUrl === "undefined" ||
        typeof findProvidersApiUrl === "undefined") {
        console.log('findProviderTile script requires data-findProviderApiUri and data-findProviderRedirectUrl to be passed via the script tag');
        return;
    }

    if (findProvidersApiUrl !== null && findProvidersApiUrl.substr(-1) !== '/') findProvidersApiUrl += '/';
    
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
            showSearchTermError("Enter a postcode or town");
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
});
