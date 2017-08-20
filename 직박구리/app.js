var Botkit = require('botkit');
const client = require('./request/httpClient');
const database = require('./database');
const Product = require('./database/model/product');
const req = require('request');
const regex = initialCommand();
const regexTest = require('./regexes/regex');

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
        console.log(err);
        throw new Error('Could not connect to Slack');
    }

    database.connect();
});

controller.hears(["더", "더 보여줘"], ["direct_message", "direct_mention", "mention"], function (bot, message) {
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

    shoppingSearch(encoded, index + 3, 3, orderBy)
        .then(onRespond)
        .then(logging)
        .catch(onError);
});

controller.hears(['보여줘', regex], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    const token = regexTest.getTokens(message.text, regex);
    if (token === null) return bot.reply(message, '명령어를 잘못 입력하셨어요!');

    const keyword = token.keyword;
    var orderBy;
    ['asc', 'date', 'dsc', 'sim'].forEach(function (element) {
        console.log(require('./config/' + element + '.config').values);
        if (require('./config/' + element + '.config').values.includes(token.orderBy)) orderBy = element;
    });

    const encoded = encodeURI(keyword);

    const onRespond = (response) => {
        bot.reply(message, response);
        return;
    }

    const logging = () => {
        log[message.user] = {
            "keyword": keyword,
            "index": 1,
            "orderBy": orderBy // 나중에 유동적으로 바뀌어야함
        }
    }
    const onError = (err) => {
        bot.reply(message, err.message);
    }

    shoppingSearch(encoded, 1, 3, orderBy)
        .then(onRespond)
        .then(logging)
        .catch(onError);

});

controller.hears(["장바구니 추가", /^\d+\s장바구니\s추가+/mg], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    const index = Number(message.text.split(" ")[0]);

    if (isNaN(index)) return bot.reply(message, '수작부리지 마라');

    if (typeof log[message.user] === "undefined") return bot.reply(message, '뭘 임마;;');

    const past = log[message.user];

    const keyword = past.keyword;
    const orderBy = past.orderBy;
    const encoded = encodeURI(keyword);

    shoppingSearch(encoded, index, 1, orderBy)
        .then((resMessage) => {
            bot.api.users.info({
                user: message.user
            }, function (err, info) {
                if (err) throw err;

                const productName = resMessage.attachments[0].title.substring(3);
                const productLink = resMessage.attachments[0].title_link;
                const price = resMessage.attachments[0].fields[0].title;
                const mallName = resMessage.attachments[0].footer;
                const image_url = resMessage.attachments[0].image_url;
                const adderName = info.user.name;
                Product.create(productName, price, mallName, productLink, adderName, image_url)
                    .then((product) => {
                        bot.reply(message, resMessage.attachments[0].title + ' -  추가 완료!');
                    })
                    .catch((err) => {
                        bot.reply(message, '중복된 상품입니다.');
                    })
            })
        })
        .catch((err) => {
            bot.reply(message, err.message);
        })
});

controller.hears(["항목 삭제", /^\d+\s항목\s삭제+/mg], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    const index = Number(message.text.split(" ")[0]);

    if (isNaN(index)) return bot.reply(message, '수작부리지 마라');

    Product.findAll()
        .then((products) => {
            if (products.length < index) throw new Error('존재하지 않는 항목이에요!');
            return Product.findByIdAndRemove({
                "_id": products[index - 1]._id
            }).exec();
        })
        .then((product) => {
            bot.reply(message, index + ". " + product.productName + " 항목이 삭제되었습니다.");
        })
        .catch((err) => {
            bot.reply(message, err.message);
        });
});

controller.hears(["장바구니"], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    Product.findAll()
        .then((products) => {
            const resMessage = {
                attachments: []
            };
            const totals = [0, 0, 0];
            if (products.length === 0) return bot.reply(message, '장바구니가 비었습니다!!');
            for (let i = 0; i < products.length; i++) {
                const item = {
                    "text": `${products[i].adderName}님이 추가함`,
                    "fallback": "Required plain-text summary of the attachment.",
                    "color": getRandomColor(),
                    "author_icon": "http://flickr.com/icons/bobby.jpg",
                    "title": (i + 1) + ". " + products[i].productName,
                    "title_link": products[i].productLink,
                    "fields": [{
                        "title": products[i].price,
                        "short": false
                    }],
                    "thumb_url": products[i].image_url,
                    "footer": products[i].mallName,
                    "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png"
                }
                const lprice = Number(products[i].price.replace(/\,/g, '').split('원 ~ ')[0]);
                const hprice = Number(products[i].price.replace(/\,/g, '').split('원 ~ ')[1].split('원')[0]);

                totals[0] += lprice;
                totals[1] += (lprice + hprice) / 2.0;
                totals[2] += hprice;

                resMessage.attachments.push(item);
                if (i === products.length - 1) {
                    bot.reply(message, resMessage);
                    bot.reply(message, {
                        "text": "`최저가` *" + numberWithCommas(totals[0]) + "원*\n `평균가` *" + numberWithCommas(totals[1]) + "원*\n `최고가` *" + numberWithCommas(totals[2]) + "원*\n",
                        "mrkdwn": true
                    })
                }
            }
        })
        .catch((err) => {
            bot.reply(message, '오류 발생 삐릿삐릿 ㅜㅜ');
        })
});

controller.hears(["구매완료", /^\d+\s구매완료$/mg], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    const index = Number(message.text.split(' ')[0]);

    if (isNaN(index)) return bot.reply(message, '명령어를 잘못 입력하셨습니다.');
    var productName;
    Product.findAll()
        .then((products) => {
            if (products.length < index) throw new Error('존재하지 않는 항목이에요!');
            if (products.length === 0) throw new Error('장바구니가 비었습니다!!');
            productName = products[index - 1].productName;
            bot.api.users.info({
                user: message.user
            }, function (err, info) {
                if (err) throw new Error('오류가 발생했어요!');

                return Product.findOneAndUpdate({
                    "_id": products[index - 1]._id
                }, {
                    $set: {
                        isBuyed: true,
                        buyedAt: Date.now(),
                        buyer: info.user.name
                    }
                }).exec();
            })

        })
        .then((product) => {
            console.log(product);
            bot.reply(message, index + ". " + productName + " 항목을 구매처리하였습니다.");
        })
        .catch((err) => {
            console.log(err);
            bot.reply(message, err.message);
        });
});

controller.hears(["구매내역", /구매내역/mg], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    Product.findAllHistory()
        .then((products) => {
            if (products.length === 0) throw new Error('구매내역이 없습니다.');
            const resMessage = {
                attachments: []
            };
            for (var i = 0; i < products.length; i++) {
                const item = {
                    "text": `${products[i].buyer}님이 구매함`,
                    "fallback": "Required plain-text summary of the attachment.",
                    "color": getRandomColor(),
                    "author_icon": "http://flickr.com/icons/bobby.jpg",
                    "title": (i + 1) + ". " + products[i].productName,
                    "title_link": products[i].productLink,
                    "fields": [{
                        "title": products[i].price,
                        "short": false
                    }],
                    "thumb_url": products[i].image_url,
                    "footer": products[i].mallName,
                    "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png"
                }
                resMessage.attachments.push(item);
                if (i === products.length - 1) {
                    bot.reply(message, resMessage);
                }
            }
        })
});

controller.hears(["배송추적", /^배송추적/], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    sweet(bot, message, message.text.split(' ')[1], message.text.split(' ')[2]);
});

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}

function shoppingSearch(keyword, startIndex, display, orderBy) {
    return new Promise((resolve, reject) => {
        client.request('/v1/search/shop.json?query=' + keyword + '&display=3&start=' + startIndex + '&sort=' + orderBy, (err, body) => {
            if (err) reject(new Error('오류발생! 삐용삐용!'));

            const result = JSON.parse(body);

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
                    "title": (startIndex + i) + ". " + result.items[i].title.replace(/<b>/gi, '').replace(/<\/b>/gi, ''),
                    "title_link": result.items[i].link,
                    "fields": [{
                        "title": numberWithCommas(result.items[i].lprice) + "원 ~ " + numberWithCommas(result.items[i].hprice) + "원",
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

function initialCommand() {
    var commands = require('./config/asc.config').values;
    commands = commands.concat(require('./config/dsc.config').values);
    commands = commands.concat(require('./config/sim.config').values);
    commands = commands.concat(require('./config/date.config').values);

    var regex = '(.{0,10})(';
    commands.forEach(function (element) {
        regex += element + '|';
    }, this);
    regex = regex.slice(0, -1);
    regex += ')\\s(.{0,10})(보여|찾아|검색|보자|찾자)';
    regex = new RegExp(regex);
    console.log(regex);
    return regex
    // // 사용 예
    // const testRegex = require('./regexes/regex');

    // return testRegex.getTokens('싼순서로 김치 보여줘', c);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sweet(bot, message, code, invoice) {
    req.get({
        "uri": `http://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=X2CXrFes215oM4fQHMD6eQ&t_code=${code}&t_invoice=${invoice}`
    }, function (err, res, body) {
        const result = JSON.parse(body);
        bot.reply(message, {
            "attachments": [{
                "color": "#36a64f",
                "pretext": `${result.itemName}에 대한 정보는 다음과 같습니다`,
                "author_name": `${result.invoiceNo}`,
                "author_link": "http://flickr.com/bobby/",
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": `${result.itemName}`,
                "title_link": "https://api.slack.com/",
                "text": `${result.estimate}`,
                "fields": [{
                    "title": "현재진행단계",
                    "value": `${result.level}`,
                    "short": false
                }],
                "thumb_url": `${result.itemImage}`,
                "footer": "Slack API",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": 123456789
            }]
        })
    })
}