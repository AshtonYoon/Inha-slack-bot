let mongoose = require('mongoose');
let database = {};

database.connect = function () {
    mongoose.Promise = global.Promise;
    console.log(process.env.DB_URL);
    mongoose.connect(process.env.DB_URL);
    database.connection = mongoose.connection;
    database.connection.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.connection.on('open', function () {
        console.log('데이터베이스에 연결되었습니다. : ' + process.env.DB_URL);

    });
    database.connection.on('disconnected', () => {
        console.log('오류 발생 삐릿삐릿');
    });
}


module.exports = database;