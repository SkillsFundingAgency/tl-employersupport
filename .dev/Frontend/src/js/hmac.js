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
