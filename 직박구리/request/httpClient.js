const req = require('request');

const naverAPIUri = 'https://openapi.naver.com'

const headers = {
    'X-Naver-Client-Id': 'PR5EBETH6ZB5h5HgnY2F',
    'X-Naver-Client-Secret': 'KzfIqtBspr'
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