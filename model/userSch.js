const mongoose = require('mongoose');
var Schema = mongoose.Schema;
//用户表
const userSchema = new mongoose.Schema({
    userName: { type: String,trim:true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number },
    avatar: { type: String, default: '' },
    attachmentNote: [{ type: Schema.Types.ObjectId, ref: 'note' }], //用户发布笔记
    createTime: { type: Date, default: Date.now },
    sex:{type:Number,default:0}//1女，0男
});
const user = mongoose.model('user', userSchema);

module.exports = {
    user
};