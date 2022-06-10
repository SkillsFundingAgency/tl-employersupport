// Find Provider 
let isFapSearchInProgress = false;

function FindProvider(
    findProvidersApiUri,
    findProvidersAppId,
    findProvidersApiKey,
    qualificationArticleMap) {

    if (typeof findProvidersApiUri === "undefined" ||
        typeof findProvidersAppId === "undefined" ||
        typeof findProvidersApiKey === "undefined") {
        console.log('findProvider script requires findProviderApiUri, findProviderAppId and findProviderApiKey parameters');
        return;
    }

    if (findProvidersApiUri !== null && findProvidersApiUri.substr(-1) !== '/') findProvidersApiUri += '/';

    let activeSearchQuery = null;
    let currentPage = 0;
    let currentSearchTerm = null;
    let currentQualificationIds = [];

    //initialize autocomplete
    new LocationAutocomplete(findProvidersApiUri);

    if ($("#tl-skill-area-filter").length) loadRoutes();

    //Check for search term query parameter
    let searchTerm = getUrlParameter("searchTerm");
    if (searchTerm) {
        searchTerm = urlDecode(searchTerm);
        //Remove query string from url
        const urlSplit = (window.location.href).split("?");
        const obj = { Title: document.title, Url: urlSplit[0] };
        history.pushState(obj, obj.Title, obj.Url);
        providerSearch(searchTerm);
    } else {
        $('.tl-fap--noresult').removeClass("tl-hidden");
        $('.tl-fap--result').addClass("tl-hidden");
    }

    $('#tl-search-term').keypress(function (e) {
        if (e.which === 13) {
            $("#tl-search-providers").click();
            return false;
        }
    });

    $("#tl-search-providers").click(function () {
        return providerSearch($("#tl-search-term").val().trim(), getQualificationIds());
    });

    function qualificationSelectionChanged() {
        if (!$("#tl-search-term").val().trim()) return false;
        return providerSearch($("#tl-search-term").val().trim(), getQualificationIds());
    }

    $(".tl-fap-search-providers-form").submit(function () {
        event.preventDefault();
    });

    $("#tl-next-results-link").click(function () {
        event.stopPropagation();
        event.preventDefault();
        callProviderSearchApi(currentSearchTerm, currentQualificationIds, currentPage + 1);
        return false;
    });

    function getQualificationIds() {
        const qualificationIds = [];
        $('#tl-skill-area-filter .tl-checkbox:checked').each(
            function (_, item) {
                qualificationIds.push(item.value);
            });

        return qualificationIds;
    }

    function loadRoutes() {
        const uri = findProvidersApiUri + "routes";
        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            populateRoutes(response);
        }).fail(function (error) {
            console.log('Call to get routes failed. ' + error);
        });
    }

    let details = null;
    let showAll = null;

    function populateRoutes(data) {
        const skillAreasList = $("#tl-skill-area-filter");
        skillAreasList.find(".tl-fap--filter--section").remove();

        $.each(data,
            function (_, item) {
                if (!item.numberOfQualificationsOffered) return;

                let skillArea = '<div class="tl-fap--filter--section"> \
                                   <h4 class="govuk-heading-s govuk-!-margin-top-2">' +
                    item.name + '<br /> \
                                     <span class="govuk-body-s tl-text--grey" id="tl-fap--filter--checkstatus"></span> \
                                    </h4> \
                                    <details class="tl-fap--filter--details"> \
                                    <summary data-open="Hide T Levels" data-close="Show T Levels" class="govuk-!-margin-bottom-1"></summary> \
                                    <div>';

                $.each(item.qualifications,
                    function (_, qualification) {
                        const qualificationId = 'tl_subject_' + qualification.id;
                        skillArea += '<div class="govuk-checkboxes govuk-checkboxes--small"> \
                                                    <div class="govuk-checkboxes__item"> \
                                                        <input id="' + qualificationId +
                            '" name="' + qualificationId +
                            '" type="checkbox" ' +
                            'value="' + qualification.id +
                            '" class="tl-checkbox govuk-checkboxes__input"> \
                                                        <label for="' + qualificationId +
                            '" class="govuk-body-s govuk-checkboxes__label">' + qualification.name + '</label> \
                                                    </div> \
                                                </div>';
                    });

                skillArea += '        </div> \
                                            </details> \
                                            <hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-4 govuk-!-margin-top-2"> \
                                        </div>';

                skillAreasList.append(skillArea);
            });

        addCheckboxHandlers();
    };

    function providerSearch(searchTerm, qualificationIds, page) {
        clearProviderSearchResults();
        searchTerm = searchTerm ? searchTerm.trim() : "";
        if (searchTerm === "") {
            if (event) event.stopPropagation();
            showSearchTermError("Enter postcode or town");
            return false;
        }

        if (!searchTerm.match(/^[0-9a-zA-Z,\.'\-!&\(\)/\s]+$/)) {
            if (event) event.stopPropagation();
            showSearchTermError("Enter a valid postcode or town");
            return false;
        }

        callProviderSearchApi(searchTerm, qualificationIds, page);

        return true;
    }

    function callProviderSearchApi(searchTerm, qualificationIds, page, pageSize) {
        //if (isFapSearchInProgress) return false;
        isFapSearchInProgress = true;

        page = (page === undefined ? 0 : page);
        pageSize = (pageSize === undefined ? 5 : pageSize);

        const encodedSearchTerm = encodeURIComponent(searchTerm).replace(/'/g, '%27');
        let uri = findProvidersApiUri + "providers?searchTerm=" + encodedSearchTerm + '&page=' + page + '&pageSize=' + pageSize;

        if (qualificationIds && qualificationIds.length > 0) {
            qualificationIds.forEach(function (id) {
                uri += "&qualificationId=" + id;
            });
        }

        //Assign uri to global level variable, then check when query returns to see if it's changed
        activeSearchQuery = uri;

        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            if (response.error) {
                console.log("Invalid providers search response received - " + response.error);
                showSearchTermError("Enter a valid postcode or town");
            } else if (activeSearchQuery !== uri) {
                console.log('ignoring results because current query does not match active query:');
                console.log('uri = ' + uri);
                console.log('active query = ' + activeSearchQuery);
                return;
            } else {
                console.log('search results ok for ' + uri);
                currentPage = page;
                currentSearchTerm = searchTerm;
                currentQualificationIds = qualificationIds;
                populateProviderSearchResults(response, page, pageSize);
            }
            setTimeout(function () {
                //delay to avoid autocomplete suggestions loading
                isFapSearchInProgress = false;
            }, 200);
        }).fail(function (jqxhr) {
            showError(jqxhr.status, jqxhr.responseText);
            isFapSearchInProgress = false;
        });

        return true;
    }

    function clearProviderSearchResults() {
        $('#tl-error').addClass("tl-hidden");
        $('#tl-search-term-error').addClass("tl-hidden");
        $('.tl-fap--noresult').addClass("tl-hidden");
        $("#tl-next-results-link").addClass("tl-hidden");
        $("#tl-fap--results").find(".tl-fap--result").remove();
        currentPage = 0;
    }

    function populateProviderSearchResults(data, page, pageSize) {
        if (data.searchTerm && data.searchTerm !== $("#tl-search-term").val()) {
            $("#tl-search-term").val(data.searchTerm);
        }

        if ((!data.searchResults || data.searchResults.length === 0) && currentPage === 0) {
            $('.tl-fap--noresult').removeClass("tl-hidden");
            $('.tl-fap--result').addClass("tl-hidden");

            return;
        }

        $.each(data.searchResults,
            function (_, providerLocation) {
                let searchResult =
                    '<div class="tl-fap--result"> \
                             <h3 class="govuk-heading-m govuk-!-margin-bottom-1">' + providerLocation.providerName + ' <span class="tl-fap--distance">' + providerLocation.distance.toFixed(0) + ' miles</span></h3> \
                             <p class="govuk-body"><span>' + providerLocation.town + '</span> | ' + providerLocation.postcode + '</p>';

                const locationDeliveryYears = [];
                let availableNow = null;
                $.each(providerLocation.deliveryYears,
                    function (_, deliveryYear) {
                        if (typeof deliveryYear.routes === "undefined") return;

                        if (deliveryYear.isAvailableNow) {
                            if (availableNow) {
                                for (let i = 0; i < deliveryYear.routes.length; i++) {
                                    if (availableNow.routes.filter(function (r) { return r.name === deliveryYear.routes[i].name; }).length === 0)
                                        availableNow.routes.push(deliveryYear.routes[i]);
                                }
                            } else {
                                availableNow = deliveryYear;
                                locationDeliveryYears.push(availableNow);
                            }
                        } else {
                            locationDeliveryYears.push(deliveryYear);
                        }
                    });

                if (availableNow && !typeof availableNow.routes !== "undefined" && availableNow.routes) {
                    availableNow.routes.sort(function (x, y) { return (x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0) });
                }
                //Obsolete v2 code
                if (availableNow && !typeof availableNow.qualifications !== "undefined" && availableNow.qualifications) {
                    availableNow.qualifications.sort(function (x, y) { return (x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0) });
                }
                /////

                searchResult += '</p><div class="tl-fap--courses">';

                $.each(locationDeliveryYears,
                    function (_, deliveryYear) {
                        if (deliveryYear.isAvailableNow) {
                            searchResult += '<div class="tl-fap--courses--box tl-fap--courses--box--now"> \
                                        <h4 class="govuk-body govuk-!-font-weight-bold">T Levels available now:</h4>';
                        } else {
                            searchResult += '<div class="tl-fap--courses--box"> \
                                        <h4 class="govuk-body govuk-!-font-weight-bold">T Levels available from September  ' + deliveryYear.year + ':</h4>';
                        }

                        //Obsolete v2 code
                        if ((!typeof deliveryYear.routes === "undefined" || deliveryYear.routes === null) &&
                            (typeof deliveryYear.qualifications !== "undefined" || deliveryYear.qualifications !== null)) {
                            console.log('using v2 qualifications');
                            searchResult += '<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-1">';
                            $.each(deliveryYear.qualifications,
                                function (_, qualification) {
                                    const articleLink = typeof qualificationArticleMap !== "undefined" ?
                                        qualificationArticleMap[qualification.id] : null;
                                    if (articleLink) {
                                        searchResult += '<li><a target="_blank" class="govuk-link tl-fap--result-course" href="' + articleLink + '">' + qualification.name + '</a></li>';
                                    } else {
                                        searchResult += '<li>' + qualification.name + '</li>';
                                    }
                                });
                            return;
                        }
                        /////

                        if (!typeof deliveryYear.routes === "undefined" || deliveryYear.routes === null) return;

                        $.each(deliveryYear.routes,
                            function (_, route) {
                                searchResult += '<p class="govuk-body govuk-!-margin-top-2 govuk-!-margin-bottom-1">' + route.name + '</p> \
                                <ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-1">';

                                $.each(route.qualifications,
                                    function (_, qualification) {
                                        const articleLink = typeof qualificationArticleMap !== "undefined" ?
                                            qualificationArticleMap[qualification.id] : null;
                                        if (articleLink) {
                                            searchResult += '<li><a target="_blank" class="govuk-link tl-fap--result-course" href="' + articleLink + '">' + qualification.name + '</a></li>';
                                        } else {
                                            searchResult += '<li>' + qualification.name + '</li>';
                                        }
                                    });

                                searchResult += '</ul>';
                            });

                        searchResult += '</div>';
                    });
                searchResult += '</div>';

                if (providerLocation.telephone || providerLocation.website || providerLocation.email) {
                    let contactDetails = providerLocation.telephone
                        ? 'Telephone: <strong>' + providerLocation.telephone + '</strong>'
                        : "";
                    if (providerLocation.website) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += '<a target="_blank" href="' + providerLocation.website + '" class="govuk-link tl-fap--result-website">Visit <span class="govuk-visually-hidden">' + providerLocation.providerName + '</span> website</a>';
                    }
                    if (providerLocation.email) {
                        if (contactDetails) contactDetails += ' | ';
                        contactDetails += 'Email: <a href="mailto:' + providerLocation.email + '" class="govuk-link govuk-!-margin-right-4 tl-fap--result-email">' + providerLocation.email + '</a>';
                    }

                    searchResult += '<h4 class="govuk-body govuk-!-font-weight-bold govuk-!-margin-top-5 govuk-!-margin-bottom-2">Get in touch:</h4> \
                        <p class="govuk-body">' + contactDetails + '</p>';
                }

                $("#tl-fap--results").append(searchResult);
            });

        if (typeof data.totalResults !== "undefined" &&
            data.totalResults !== null &&
            data.totalResults <= ((page + 1) * pageSize)) {
            $('#tl-next-results-link').addClass("tl-hidden");
        } else {
            $('#tl-next-results-link').removeClass("tl-hidden");
        }
    }

    function showError(status, errorText) {
        console.log("Error status " + status + " was encountered. " + errorText);
        switch (status) {
            case 0:
                $("#tl-error-header").text('There is a problem with your network connection.');
                $("#tl-error-detail").html('There is a problem with your network connection. Check you’re connected to the internet and try again.');
                break;
            default:
                $("#tl-error-header").text('Sorry, there is a problem with the service.');
                $("#tl-error-detail").html('Try again later or <a class="govuk-link tl-error--contact" href="https://test.employers.tlevels.gov.uk/hc/en-gb/requests/new">contact us</a> quoting error code ' + status);
        }

        clearProviderSearchResults();
        $('#tl-error').removeClass("tl-hidden");
    }

    function showSearchTermError(message) {
        $("#tl-search-term-error").text(message);
        $('#tl-search-term-error').removeClass("tl-hidden");
        $('#tl-error').addClass("tl-hidden");
        $('.tl-fap--noresult').removeClass("tl-hidden");
    }

    function addHmacAuthHeader(xhr, uri, appId, apiKey) {
        const ts = Math.round((new Date()).getTime() / 1000);
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        const nonce = CryptoJS.enc.Hex.parse(uuid);
        const data = appId + "GET" + uri.toLowerCase() + ts + nonce;

        const hash = CryptoJS.HmacSHA256(data, apiKey);
        const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

        xhr.setRequestHeader("Authorization", "amx " + appId + ":" + hashInBase64 + ":" + nonce + ":" + ts);
    }

    function urlDecode(str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    }

    function getUrlParameter(key, url) {
        if (!url) {
            url = window.location.search.substring(1);
        }
        const urlVars = url.split('&');
        for (let i = 0; i < urlVars.length; i++) {
            const parameter = urlVars[i].split('=');
            if (parameter[0] === key) {
                return parameter[1];
            }
        }

        return null;
    }

    //filter list javascript
    function checkChange() {
        const totalNumberOfChecked = $(this).parents('.tl-fap--filter--content').find('input[type=checkbox]:checked');
        const numberOfChecked = $(this).parents('.tl-fap--filter--section').find('input[type=checkbox]:checked');
        const totalCheckboxes = $(this).parents('.tl-fap--filter--section').find('input[type=checkbox]');

        /// Display number of checked items in each section
        $(this).parents('.tl-fap--filter--section').find('#tl-fap--filter--checkstatus').html("(" + numberOfChecked.length + " of " + totalCheckboxes.length + " selected)");

        /// Get checked items and display at top
        const checkedSection = $(this).parents('.tl-fap--filter--content').find('input[type=checkbox]:checked').parents('.tl-fap--filter--section');
        if (totalNumberOfChecked.length !== 0) {
            $(".tl-fap--filter--selected").html('');

            checkedSection.sort(function(x, y) {
                return ($(x).text() < $(y).text()) ? -1 : (($(x).text() > $(y).text()) ? 1 : 0);
            });

            checkedSection.each(function () {
                var checkedSectionBoxes = $(this).find('input[type=checkbox]:checked');
                if (checkedSectionBoxes.length !== 0) {
                    $(".tl-fap--filter--selected").append('<h5>' + $(this).find("h4").clone().children().remove().end().text() + '</h5>');

                    checkedSectionBoxes.each(function () {
                        var checkedSectionValue = $(this).attr("id");
                        $(".tl-fap--filter--selected").append('<span tabindex="0" data-check="' + checkedSectionValue + '">' + $(this).next("label").text() + '</span>');
                    });
                }
            });
            $(".tl-fap--filter--clearall").removeClass("tl-hidden");
            $(".tl-fap--filter").attr("active", "true");
        }
        else {
            $(".tl-fap--filter--selected").html('<p class="govuk-body-s govuk-!-margin-bottom-1">No filters selected</p>');
            $(".tl-fap--filter--clearall").addClass("tl-hidden");
            $(".tl-fap--filter").removeAttr("active");
        }
    };

    /// Allow checkboxes to be unchecked by clicking summary items at top
    function checkRemove() {
        const clickvalue = $(this).attr("data-check");
        $('.tl-fap--filter--section').find('input[id=' + clickvalue + ']:checked').trigger("click");
    };
    $(document).on("click", ".tl-fap--filter--selected span", checkRemove);

    function checkDetailsChange() {
        details.each(function () {
            if ($(this).is("[open]")) {
                showAllOpen();
                return false;
            } else {
                showAllClose();
            }
        });
    };

    function showAllClose() {
        showAll.removeAttr("open");
        showAll.text("Show all");
    }

    function showAllOpen() {
        showAll.attr('open', '');
        showAll.text("Hide all");
    }

    function addCheckboxHandlers() {
        /// Run checkbox change function on page load and on checkbox change
        $('.tl-fap--filter--content input[type=checkbox]').change(checkChange);
        $(".tl-fap--filter--section .govuk-checkboxes").each(checkChange);
        $('.tl-fap--filter--content input[type=checkbox]').change(qualificationSelectionChanged);

        /// Show hide sections / all sections
        details = $(".tl-fap--filter--details");
        showAll = $(".tl-fap--filter--showall");
        clearAll = $(".tl-fap--filter--clearall");

        details.on('toggle',
            function () {
                checkDetailsChange();
            });

        showAll.click(function () {
            if ($(this).is("[open]")) {
                details.removeAttr("open");
                showAllClose();
            } else {
                details.attr('open', '');
                showAllOpen();
            }
        });

        clearAll.on('click', function () {
            console.log('clear all clicked');
            if ($('#tl-skill-area-filter .tl-checkbox:checked').length > 0) {
                console.log('unchecking');
                $('#tl-skill-area-filter .tl-checkbox:checked').prop('checked', false);
                checkChange();
    
                if ($("#tl-search-term").val().trim()) {
                    return providerSearch($("#tl-search-term").val().trim(), getQualificationIds());
                }
            }
            console.log('nothing to uncheck');
            return false;
        });
    }

    $("#tl-fap--filter--button").click(function () {
        if ($(this).is("[open]")) {
            $(this).removeAttr("open");
            $(".tl-fap--filter").removeAttr("open");
            $(this).text("Show filter");
        }
        else {
            $(this).attr('open', '');;
            $(".tl-fap--filter").attr('open', '');;
            $(this).text("Hide filter");
        }
        return false;
    });
};
