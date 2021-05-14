$(document).ready(function () {
    $(document).on("change", ".address-item", function () {
        $("#Latitude").val("");
        $("#Longitude").val("");
    });
});

// provides the matching addresses from postcode
//if (typeof (postcodeAnywhereApiKey) !== 'undefined')
(function ($) {
    var searchContext = "",
        //uri = $('form').attr('action'),
        findAddressVal = $("#postcode-search").val();

    $('#enterAddressManually').on('click',
        function (e) {
            e.preventDefault();
            $('#addressManualWrapper').unbind('click');

            $('#address-details').removeClass('disabled');
            $('#AddressLine1').focus();
        });

    $('#addressManualWrapper').bind('click',
        function () {
            $(this).unbind('click');
            $('#address-details').removeClass('disabled');
            $('#AddressLine1').focus();
        });

    $("#postcode-search").keyup(function () {
        findAddressVal = $(this).val();
    });

    $("#postcode-search").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "//services.postcodeanywhere.co.uk/CapturePlus/Interactive/Find/v2.10/json3.ws",
                dataType: "jsonp",
                data: {
                    key: postcodeAnywhereApiKey,
                    country: 'GB',
                    searchTerm: request.term,
                    lastId: searchContext
                },
                timeout: 5000,
                success: function (data) {
                    //console.log(JSON.stringify(data));

                    $('#postcodeServiceUnavailable').hide();
                    $('#enterAddressManually').hide();
                    $('#addressLoading').show();

                    $("#postcode-search").one('blur', function () {
                        $('#enterAddressManually').show();
                        $('#addressLoading').hide();
                    });

                    response($.map(data.Items, function (suggestion) {
                        return {
                            label: suggestion.Text,
                            value: "",
                            data: suggestion
                        }
                    }));
                },
                error: function () {
                    $('#postcodeServiceUnavailable').show();
                    $('#enterAddressManually').hide();
                    $('#address-details').removeClass('disabled');
                }
            });
        },
        messages: {
            noResults: function () {
                return "We can't find an address matching " + findAddressVal;
            },
            results: function (amount) {
                return "We've found " + amount + (amount > 1 ? " addresses" : " address") +
                    " that match " + findAddressVal + ". Use up and down arrow keys to navigate";
            }
        },
        select: function (event, ui) {
            var item = ui.item.data;

            if (item.Next === "Retrieve") {
                //retrieve the address
                retrieveAddress(item.Id);
            } else {
                var field = $(this);
                searchContext = item.Id;

                $('#addressLoading').show();
                $('#enterAddressManually').hide();
                $('#postcodeServiceUnavailable').hide();

                if (searchContext === "GBR|") {
                    window.setTimeout(function () {
                        field.autocomplete("search", item.Text);
                    });
                } else {
                    window.setTimeout(function () {
                        field.autocomplete("search", item.Id);
                    });
                }
            }
        },
        focus: function (event, ui) {
            $("#addressInputWrapper").find('.ui-helper-hidden-accessible').text("To select " + ui.item.label + ", press enter");
        },
        autoFocus: true,
        minLength: 1,
        delay: 100
    }).focus(function () {
        searchContext = "";
    });

    function retrieveAddress(id) {
        $('#addressLoading').show();
        $('#enterAddressManually').hide();
        $('#postcodeServiceUnavailable').hide();
        $('#address-details').addClass('disabled');

        $.ajax({
            url: "//services.postcodeanywhere.co.uk/CapturePlus/Interactive/Retrieve/v2.10/json3.ws",
            dataType: "jsonp",
            data: {
                key: postcodeAnywhereApiKey,
                id: id
            },
            timeout: 5000,
            success: function (data) {
                if (data.Items.length) {
                    $('#address-details').removeClass('disabled');
                    $('#addressLoading').hide();
                    $('#enterAddressManually').show();
                    $('#addressManualWrapper').unbind('click');
                    $("#postcode-search").val("");

                    populateAddress(data.Items[0]);
                }
            },
            error: function () {
                $('#postcodeServiceUnavailable').show();
                $('#enterAddressManually').hide();
                $('#addressLoading').hide();
                $('#address-details').removeClass('disabled');
            }
        });
    }

    function populateAddress(address) {
        if (!$('#CompanyName').val()) {
            $('#CompanyName').val(address.Company);
        }
        $('#AddressLine1').val(address.Line1);
        $('#AddressLine2').val(address.Line2);
        $('#AddressLine3').val(address.Line3);
        $('#AddressCity').val(address.City);
        $('#Postcode').val(address.PostalCode);

        $('#ariaAddressEntered').text('Your address has been entered into the fields below.');

        populateLatLng(address);

        //Webtrends.multiTrack({ element: this, argsa: ["DCS.dcsuri", uri + "/findaddress", "WT.dl", "99", "WT.ti", "Settings – Find Address"] });
    }

    function populateLatLng(address) {
        var url = "https://api.postcodes.io/postcodes/" + address.PostalCode,
            json;

        $.get(url)
            .done(function (data) {
                json = data;

                if (json.status === 200 && json.result !== null) {
                    $("#Latitude").val(json.result.latitude);
                    $("#Longitude").val(json.result.longitude);
                } else {
                    //console.log("Call to get lat-long failed");
                }

            })
            .fail(function () {
                //console.log("call to get lat-long failed");
            });
    }
})(jQuery);
