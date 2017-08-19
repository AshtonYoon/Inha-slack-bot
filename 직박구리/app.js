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
    
});

controller.hears(['보여줘', '.+\s{0,10} 보여줘'], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {

    const name = message.text.substring(0, message.text.length - 3);

    const encoded = encodeURI(name);

    client.request('/v1/search/shop.json?query=' + encoded + '&display=3&start=1&sort=sim', (err, body) => {
        if (err) return bot.reply(message, "응~ 지랄마~");

        const result = JSON.parse(body);

        if (typeof result.errorCode !== "undefined") return bot.reply(message, "응~ 지랄마~");

        if (result.items.length === 0) return bot.reply(message, "검색 결과가 없습니다.");

        var resMessage = {
            "text": result.total + "개의 결과가 검색되었습니다",
            "attachments": []
        }

        if (err) return bot.reply(message, "응~ 지랄마~");

        for (let i = 0; i < result.items.length; i++) {
            const item = {
                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
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
                log[message.user] = {
                    "name": name,
                    "index": 3
                };
                console.log(log);
                return bot.reply(message, resMessage);
            }
        }
    });
});

controller.hears(["덥다", "더워", "더워요"], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    bot.reply(message, resMessage);
});


/*
원태형 죄송해요.. 구현해야한다는 압박감에 못이겨 그만..
*/