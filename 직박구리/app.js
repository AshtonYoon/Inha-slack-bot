var Botkit = require('botkit');
const client = require('./request/httpClient');

var controller = Botkit.slackbot();

const log = {

}
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

controller.hears(["Hello", "Hi"], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    bot.reply(message, 'Hello, how are you today?');
});

controller.hears(['보여줘', '.+\s{0,10}보여줘'], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {

    const name = message.text.substring(0, message.text.length - 3);
    console.log(name);
    const encoded = encodeURI(name);
    client.request('/v1/search/shop.json?query=' + encoded + '&display=10&start=1&sort=date', (err, body) => {
        if (err) throw err;
        console.log(body);
    });
});

controller.hears(["덥다", "더워", "더워요"], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    bot.reply(message, resMessage);
});