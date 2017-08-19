const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product = new Schema({
    productName : { type : String, required : true },
    productLprice : { type : Number, required : true },
    productHprice : { type : Number, required : true},
    productLink : { type : String, required : true, unique : true },
    adderName : { type :String, required : true },
    image_url : { type : String, required : true }
}, { collection : 'product'} );

module.exports = mongoose.model('product', product);