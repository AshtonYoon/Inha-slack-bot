var Botkit = require('botkit');

var controller = Botkit.slackbot();
var key = "epKApMTcjyqeXUnl9ikCX6MS-650511922822-bxox";
var bot = controller.spawn({ token: reverseString(key)});

function reverseString(str) {
    return str.split("").reverse().join("");
}

bot.startRTM(function(err,bot,payload) {
    if (err) { 
         throw new Error('Could not connect to Slack'); 
    } 
}); 

controller.hears(["바지"],["direct_message","direct_mention","mention","ambient"], function(bot,message) {
     
    bot.reply(message,resMessage); 
});

controller.hears(['보여줘', '.+\s{0,10}보여줘'], ["direct_message", "direct_mention", "mention", "ambient"], function (bot, message) {
    const name = message.text.substring(0, message.text.length - 3);
    console.log(name);
    const encoded = encodeURI(name);
    client.request('/v1/search/shop.json?query=' + encoded + '&display=10&start=1&sort=date', (err, body) => {
        if (err) throw err;

        var resMessage = {
            "text": body.Total + "개의 결과가 검색되었습니다",
            "attachments": [
                {
                    "fields": [
                        {
                            "title": body.items.title,
                            "short": true
                        },
                        {
                            "title": body.items.hprice,
                            "short": true
                        }
                    ],
                    "image_url": body.items.image
                },
                {
                    "fallback": "Would you recommend it to customers?",
                    "title": "장바구니에 담으시겠습니까?",
                    "callback_id": "comic_1234_xyz",
                    "color": "#9AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "add",
                            "text": "담기",
                            "type": "button",
                            "value": "add"
                        },
                        {
                            "name": "cancel",
                            "text": "취소",
                            "type": "button",
                            "value": "cancel"
                        }
                    ]
                }
            ]
        };
    });
});