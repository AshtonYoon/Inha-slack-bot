const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product = new Schema({
    productName : { type : String, required : true },
    mallName : { type : String, required : true },
    price : { type : String, required : true },
    productLink : { type : String, required : true, unique : true },
    adderName : { type :String, required : true },
    image_url : { type : String, required : true },
    createdAt : { type : Date, required : true, default : Date.now }
}, { collection : 'product'} );

product.statics.create = function(productName, price, mallName, productLink, adderName, image_url){
    const product = new this({
        productName,
        price,
        mallName,
        productLink,
        adderName,
        image_url
    });

    return product.save();
}

product.statics.findAll = function(){
    return this.find({}).sort({ createdAt : -1 }).exec();
}

module.exports = mongoose.model('product', product);