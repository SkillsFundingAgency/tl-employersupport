function addHmacAuthHeader(xhr, uri, appId, apiKey, method, data) {
    method = (method === undefined ? "GET" : method);
    const ts = Math.round((new Date()).getTime() / 1000);
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    const nonce = CryptoJS.enc.Hex.parse(uuid);

    var requestContentBase64String = "";
    if (data !== undefined && data) {
        var md5 = CryptoJS.MD5(data);
        requestContentBase64String = CryptoJS.enc.Base64.stringify(md5);
    }

    const dataToHash = appId + method + uri.toLowerCase() + ts + nonce + requestContentBase64String;
    const hash = CryptoJS.HmacSHA256(dataToHash, apiKey);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

    xhr.setRequestHeader("Authorization", "amx " + appId + ":" + hashInBase64 + ":" + nonce + ":" + ts);
}