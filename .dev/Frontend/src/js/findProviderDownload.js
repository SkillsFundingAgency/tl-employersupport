
    //Provider file download
    /*
    $(document).ready(function () {
        loadCsvFileDetails();

        $('.tl-provider-csv').click(function () {
            downloadFile();
        });
    });
   */
  
    function loadCsvFileDetails(findProvidersApiUri, findProvidersAppId, findProvidersApiKey) {
        const uri = findProvidersApiUri + "providers/download/info";
        $.ajax({
            type: "GET",
            url: uri,
            contentType: "application/json",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response) {
            $('.tl-provider-csv-size').text(bytesToSize(response.fileSize));
            $('.tl-provider-csv-size').removeClass("tl-hidden");
            $('.tl-provider-csv-date').text(response.formattedFileDate);
        }).fail(function (error) {
            console.log('Call to get csv file size failed. ' + error);
        });
    }

    function downloadFile(findProvidersAppId, findProvidersApiKey) {
        const uri = findProvidersApiUri + "providers/download/";
        $.ajax({
            type: "GET",
            url: uri,
            dataType: "text",
            beforeSend: function (xhr) {
                addHmacAuthHeader(xhr, uri, findProvidersAppId, findProvidersApiKey);
            }
        }).done(function (response, status, jqXHR) {
            const contentDisposition = jqXHR.getResponseHeader('Content-Disposition');
            let blob = new Blob([response], {
                type: "application/octetstream"
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = getFileName(contentDisposition);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        }).fail(function (error) {
            console.log('Call to download csv failed. ' + error);
        });       
    }

    function bytesToSize(bytes) {
        var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + sizes[i];
    }

    function getFileName(disposition) {
        const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
        const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

        if (!disposition) return null;

        let fileName = null;
        if (utf8FilenameRegex.test(disposition)) {
            fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
        } else {
            // prevent ReDos attacks by anchoring the ascii regex to string start and
            //  slicing off everything before 'filename='
            const filenameStart = disposition.toLowerCase().indexOf('filename=');
            if (filenameStart >= 0) {
                const partialDisposition = disposition.slice(filenameStart);
                const matches = asciiFilenameRegex.exec(partialDisposition);
                if (matches != null && matches[2]) {
                    fileName = matches[2];
                }
            }
        }
        return fileName;
    }
