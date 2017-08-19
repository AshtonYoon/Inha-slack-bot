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

controller.hears(["Hello","Hi"],["direct_message","direct_mention","mention","ambient"], function(bot,message) { 
    bot.reply(message,'Hello, how are you today?'); 
});

controller.hears(["바지 보여줘"],["direct_message","direct_mention","mention","ambient"], function(bot,message) {
    var resMessage = {
    "text": "{0}개의 결과가 검색되었습니다",
    "attachments": [
        {
            "fields": [
                {
                    "title": "상품 이름",
                    "short": true
                },
                {
                    "title": "가격",
                    "short": true
                }
            ],
            "image_url": "http://shopping.phinf.naver.net/main_1176561/11765612239.20170624195605.jpg?type=f140"
        },
        {
            "fallback": "Would you recommend it to customers?",
            "title": "장바구니에 담으시겠습니까?",
            "callback_id": "comic_1234_xyz",
            "color": "#9AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "recommend",
                    "text": "담기",
                    "type": "button",
                    "value": "recommend"
                },
                {
                    "name": "no",
                    "text": "취소",
                    "type": "button",
                    "value": "bad"
                }
            ]
        }
    ]
}; 
    bot.reply(message,resMessage); 
});

controller.hears(["덥다","더워","더워요"],["direct_message","direct_mention","mention","ambient"],function(bot,message) { 
    bot.reply(message,'진짜 더워요'); 
});