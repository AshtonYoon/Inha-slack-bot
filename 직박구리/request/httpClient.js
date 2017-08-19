const req = require('request');

const naverAPIUri = 'https://openapi.naver.com'

const headers = {
    'X-Naver-Client-Id': '',
    'X-Naver-Client-Secret': ''
}

exports.request = (uri, callback) => {
    req.get({
        "uri": naverAPIUri + uri,
        "headers": headers
    }, function (err, res, body) {
        if (err) throw err;
        callback(err, body);
    })
}