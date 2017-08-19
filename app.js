var Botkit = require('botkit');

var controller = Botkit.slackbot();
var bot = controller.spawn({ token: "xoxb-228229115056-R6pOqd7UahV7yawtna1LY1JM" });

bot.startRTM(function(err,bot,payload) {
    if (err) { 
         throw new Error('Could not connect to Slack'); 
    } 
}); 

controller.hears(["Hello","Hi"],["direct_message","direct_mention","mention","ambient"], function(bot,message) { 
    bot.reply(message,'Hello, how are you today?'); 
});

controller.hears(["헤헤"],["direct_message","direct_mention","mention","ambient"], function(bot,message) {
     bot.reply(message,'호호'); 
});

controller.hears(["덥다","더워","더워요"],["direct_message","direct_mention","mention","ambient"],function(bot,message) { 
    bot.reply(message,'진짜 더워요'); 
});