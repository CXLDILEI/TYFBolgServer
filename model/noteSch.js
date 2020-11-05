const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const autopopulate = require('mongoose-autopopulate');
//创建表单规则
//笔记表
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    textValue: { type: String },
    imgList: [{ imgUrl: { type: String } }],
    user: { type: Schema.Types.ObjectId, ref: 'user',autopopulate: { select:'userName phoneNumber avatar createTime' } },//所属用户
    createTime: { type: Date, required: true, default: Date.now },//创建日期
    upDateTime: { type: Date },//更新日期
    commentList: { type: Schema.Types.ObjectId, ref: 'noteComment' },//评论列表
});
//评论列表
const noteCommentSchema = new mongoose.Schema(
    [
        {
            note: { type: Schema.Types.ObjectId, ref: 'note', required: true },
            user: { type: Schema.Types.ObjectId, ref: 'user', required: true,autopopulate:{select:'userName phoneNumber avatar createTime'}},
            createTime: { type: Date, default: Date.now },
            content: { type: String, required: true },//评论内容
            liked:[{type:Schema.Types.ObjectId,ref:'user'}],
            replyList: [{type: Schema.Types.ObjectId,ref:'replyList',autopopulate:{select:'from to content createTime liked'}}],
        }
    ]//评论回复列表
);
//评论回复列表
const replyListSchema = new mongoose.Schema(
    {
        commentId:{type:Schema.Types.ObjectId,ref:'noteComment'},
        from: { type: Schema.Types.ObjectId, ref: 'user' ,autopopulate: { select:'userName phoneNumber avatar createTime' }},
        to: { type: Schema.Types.ObjectId, ref: 'user',autopopulate: { select:'userName phoneNumber avatar createTime' } },
        content: String,
        createTime: { type: Date, default: Date.now },
        liked:[{type:Schema.Types.ObjectId,ref:'user'}],
        sex:{type:Number,default:1}
        //1:男，0：女
    }
);
replyListSchema.plugin(autopopulate)
noteSchema.plugin(autopopulate)
noteCommentSchema.plugin(autopopulate)
const note = mongoose.model('note', noteSchema);
const noteComment = mongoose.model('noteComment', noteCommentSchema);
const replyList = mongoose.model('replyList', replyListSchema);

module.exports = {
    note,
    noteComment,
    replyList
};