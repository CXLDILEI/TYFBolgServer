const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//菜单表
const menuSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
});
const menu = mongoose.model('menu', menuSchema);

module.exports = {
    menu
};