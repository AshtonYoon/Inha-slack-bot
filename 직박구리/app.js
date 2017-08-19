var Botkit = require('botkit');
const client = require('./request/httpClient');

var controller = Botkit.slackbot();

const log = {};

var bot = controller.spawn({
    token: reverseString('rJNds4poZpAjglzYx7TlOVCo-986652553822-bxox')
});

function reverseString(str) {
    return str.split("").reverse().join("");
}

bot.startRTM(function (err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

controller.hears(["더", "더 보여줘"], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    if (typeof log[message.user] === "undefined") return bot.reply(message, '니가 뭘 검색했는데;;');

    const index = log[message.user].index;
    const keyword = log[message.user].keyword;
    const orderBy = log[message.user].orderBy;

    const encoded = encodeURI(keyword);

    const onRespond = (response) => {
        bot.reply(message, response);
        return;
    }

    const logging = () => {
        log[message.user] = {
            "keyword": keyword,
            "index": index + 3,
            "orderBy": orderBy // 나중에 유동적으로 바뀌어야함
        }
    }
    const onError = (err) => {
        bot.reply(message, err.message);
    }

    shoppingSearch(encoded, index + 3, orderBy)
        .then(onRespond)
        .then(logging)
        .catch(onError);
});

controller.hears(['보여줘', '.+\s{0,10} 보여줘'], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {

    const keyword = message.text.substring(0, message.text.length - 3);

    const encoded = encodeURI(keyword);

    console.log(log);

    const onRespond = (response) => {
        bot.reply(message, response);
        return;
    }

    const logging = () => {
        log[message.user] = {
            "keyword": keyword,
            "index": 1,
            "orderBy": 'sim' // 나중에 유동적으로 바뀌어야함
        }
    }
    const onError = (err) => {
        bot.reply(message, err.message);
    }

    shoppingSearch(encoded, 1, 'sim')
        .then(onRespond)
        .then(logging)
        .catch(onError);

});

controller.hears(["덥다", "더워", "더워요"], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    bot.reply(message, resMessage);
});

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}

function shoppingSearch(keyword, startIndex, orderBy) {
    return new Promise((resolve, reject) => {
        console.log('/v1/search/shop.json?query=' + keyword + '&display=3&start=' + startIndex + '&sort=' + orderBy);
        client.request('/v1/search/shop.json?query=' + keyword + '&display=3&start=' + startIndex + '&sort=' + orderBy, (err, body) => {
            if (err) reject(new Error('오류발생! 삐용삐용!'));

            const result = JSON.parse(body);
            console.log(result);
            if (typeof result.errorCode !== "undefined") reject(new Error('오류발생! 삐용삐용!'));

            if (result.items.length === 0) {
                reject(new Error('검색 결과 없쪄연!!'));
            }

            var resMessage = {
                "text": result.total + "개의 결과가 검색되었습니다",
                "attachments": []
            }

            if (err) reject(new Error('오류발생! 삐용삐용!'));

            for (let i = 0; i < result.items.length; i++) {
                const item = {
                    "fallback": "Required plain-text summary of the attachment.",
                    "color": getRandomColor(),
                    "title": result.items[i].title.replace("&lt;/b&gt;", ""),
                    "title_link": result.items[i].link,
                    "fields": [{
                        "title": result.items[i].lprice + "원",
                        "short": true
                    }],
                    "image_url": result.items[i].image,
                    "footer": result.items[i].mallName,
                    "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png"
                }

                resMessage.attachments.push(item);

                if (i == result.items.length - 1) {
                    resolve(resMessage);
                }
            }
        });
    })
}
/*
원태형 죄송해요.. 구현해야한다는 압박감에 못이겨 그만..
*/