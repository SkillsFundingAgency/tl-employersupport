$("html").addClass("govuk-template  flexbox no-flexboxtweener");
$("body").addClass("govuk-template__body js-enabled");
$(".tl-breadcrumbs li:first-child a").text("Home");


//Prevents T Levels from wrapping
$(document).ready(function () {
    $('h1, h1 a, h2, h2 a, h3, h3 a:contains("T Level")').contents().each(function () {
        if (this.nodeType == 3) {
            $(this).parent().html(function (_, oldValue) {
                return oldValue.replace(/T Level/g, "<span class='tl-nowrap'>$&</span>")
            })
        }
    });
});


//Add id to main
$(document).ready(function () {
    $("main").attr('id', 'main-content');
});


// Article voting show/hide
$(document).ready(function () {
    $(".tl-article--vote--button").click(function () {
        event.preventDefault();
        $(".tl-article--vote--buttons").addClass("tl-hidden");
        $(".tl-article--vote--question").text("Thank you for your feedback");
    });
});

// Search error messaging

var searchbox = $(".tl-search--container input[type=search]");

function showerror(message) {
    $(".tl-search--container .tl-search--error").removeClass("tl-hidden");
    $(".tl-search--container .tl-form-group").addClass("tl-form-group--error");
    $(".tl-search--container .tl-search #query").addClass("tl-input--error");
    $(".tl-search--container .tl-error--message").text(message);
    $(".tl-search--container .tl-input--error:visible:first").focus();
}

$(document).ready(function () {
    $(".tl-search--container").submit(function () {
        if (!searchbox.val()) {
            event.preventDefault();
            showerror("You must enter a search term");
        }
    });
});



// Search header messaging

var headersearchbox = $(".tl-header--search input[type=search]");

function showheadererror(message) {
    $(".tl-header--search .tl-search--error").removeClass("tl-hidden");
    $(".tl-header--search .tl-form-group").addClass("tl-form-group--error");
    $(".tl-header--search .tl-search #query").addClass("tl-input--error");
    $(".tl-header--search .tl-error--message").text(message);
    $(".tl-header--search .tl-input--error:visible:first").focus();
}

$(document).ready(function () {
    $(".tl-header--search").submit(function () {
        if (!headersearchbox.val()) {
            event.preventDefault();
            showheadererror("You must enter a search term");
        }
    });
});


/* Make tabs and details work in articles */

$(".govuk-tabs").attr("data-module", "govuk-tabs");

$(".tl-article--content .govuk-details").attr("data-module", "govuk-details");
$(".tl-article--content .govuk-details__summary").click(function () {
    if (this.closest(".govuk-details").hasAttribute("open")) {
        $(this).closest(".govuk-details").removeAttr('open');
    }
    else {
        $(this).closest(".govuk-details").attr('open', true);
    }
});


/* cookie banner starts */
//to delete cookie banner cookies ...
//document.cookie = "seen_cookie_message_help=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

function writeCookie(key, value, days) {
    var date = new Date();
    days = days || 365;// Default at 365 days
    date.setTime(+ date + (days * 86400000)); //24 * 60 * 60 * 1000
    window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";
    return value;
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

var $cookieBanner = $('#global-cookie-message-help');
var cookieHelp = readCookie('seen_cookie_message_help');

if (cookieHelp == null) {//cookie does not exist
    var href = $cookieBanner.find('.gem-c-cookie-banner__button-settings').find('.gem-c-button').attr('href');
    var url = window.location.href;
}

if (href == url) {
    $cookieBanner.find('.gem-c-cookie-banner__wrapper').hide();
} else if (cookieHelp == null) {//cookie doesn't exist
    $cookieBanner.find('.gem-c-cookie-banner__wrapper').show();
}

$cookieBanner.find('button.gem-c-button').click(function () {
    writeCookie('seen_cookie_message_help', 'cookie_policy', 365);
    writeCookie('AnalyticsConsent', 'true', 365);
    writeCookie('MarketingConsent', 'true', 365);

    $cookieBanner.find('.gem-c-cookie-banner__wrapper').hide();
    var $cookieConfirm = $cookieBanner.find('.gem-c-cookie-banner__confirmation');

    $cookieConfirm.show().find('.gem-c-cookie-banner__hide-button').click(function () {
        $cookieConfirm.hide();
    });
});
/* cookie banner ends */


/* Cookie Article, with consent starts */
var cookieConsent = $('#select-measure-analytics');

if (cookieConsent.length) {
    $('#select-measure-analytics-btn').append('<button id="saveCookieChanges" class="govuk-button" data-module="govuk-button">Save changes</button>');

    cookieConsent.append('<h3>Do you want us to measure your website use with Google Analytics?</h3><div class="govuk-form-group"><fieldset class="govuk-fieldset"><div class="govuk-radios"><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-Yes" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-Yes">Yes</label></div><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-No" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-No">No</label></div></div></fieldset></div>');

    var cookieGoogle = readCookie('AnalyticsConsent');

    if ((cookieGoogle == 'false') || (cookieGoogle == null)) {
        $('#cookie-consent-Yes').prop("checked", false);
        $('#cookie-consent-No').prop("checked", true);
    } else {//not false (unset or true)
        $('#cookie-consent-Yes').prop("checked", true);
        $('#cookie-consent-No').prop("checked", false);
    }

    $('#saveCookieChanges').on('click', function () {
        if ($('#cookie-consent-Yes').is(':checked')) {
            writeCookie('AnalyticsConsent', 'true', 365);
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
        if ($('#cookie-consent-No').is(':checked')) {
            writeCookie('AnalyticsConsent', 'false', 365); //document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; //delete cookie
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
    });

}

var cookieConsentMarketing = $('#select-measure-marketing');

if (cookieConsent.length) {
    $('#select-measure-marketing-btn').append('<button id="saveMarketingChanges" class="govuk-button" data-module="govuk-button">Save changes</button>');

    cookieConsentMarketing.append('<h3>Do you want us to use cookies that help with communication and marketing?</h3><div class="govuk-form-group"><fieldset class="govuk-fieldset"><div class="govuk-radios"><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-marketing-Yes" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-marketing-Yes">Yes</label></div><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-marketing-No" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-marketing-No">No</label></div></div></fieldset></div>');

    var cookieMarketing = readCookie('MarketingConsent');

    if ((cookieMarketing == 'false') || (cookieMarketing == null)) {
        $('#cookie-consent-marketing-Yes').prop("checked", false);
        $('#cookie-consent-marketing-No').prop("checked", true);
    } else {//not false (unset or true)
        $('#cookie-consent-marketing-Yes').prop("checked", true);
        $('#cookie-consent-marketing-No').prop("checked", false);
    }

    $('#saveMarketingChanges').on('click', function () {
        if ($('#cookie-consent-marketing-Yes').is(':checked')) {
            writeCookie('MarketingConsent', 'true', 365);
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
        if ($('#cookie-consent-marketing-No').is(':checked')) {
            writeCookie('MarketingConsent', 'false', 365); //document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; //delete cookie
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
    });

}
/* Cookie Article, with consent ends */


/* Agent USER CHECK */
function isAgent() {
    if (HelpCenter.user.role == "agent" || HelpCenter.user.role == "manager") {
        return true;
    }
    return false;
};

/* Logged in USER CHECK */
function isLoggedIn() {
    if (HelpCenter.user.role != "anonymous") {
        return true;
    }
    return false;
};


/* Open Close Chatbot */
function openHelp() {
    let iframe = $('#launcher');
    let button = iframe.contents().find('button');
    button.trigger("click");
}
function closeHelp() {
    let iframe = $('#webWidget');
    let button = iframe.contents().find('button');
    button.trigger("click");
}