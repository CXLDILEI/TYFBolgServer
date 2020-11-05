const express = require('express'),
    {noteComment,replyList} =require('../model/noteSch'),
    router = express.Router();
    const JwtUtil = require('../jwt/jwt');
    const utils = require('../utils')
    const curd = require('../curd/curd')
    // 添加评论
router.post('/addComment',function(req,res){
    let result = utils.getUserId(req.headers.token)
    noteComment.create({
        note:req.body.noteId,
        user:result,
        createTime:req.body.createTime,
        content:req.body.content
    }).then((data)=>{
        return res.send({code:0,msg:'添加成功',data:data})
    }).catch((err)=>{
        return res.send({code:1,msg:'添加错误'})
    })
})
// 获取评论列表
router.get('/getComment',function(req,res){
    let user =  utils.getUserId(req.headers.token)
    let pageData = JSON.parse(req.query.pageData)
    curd.page(noteComment,{note:req.query.noteId},pageData.page,pageData.pageSize).then((data)=>{
        let result = utils.transData(data[0])
            result.forEach(item=>{
                item.replyCount = item.replyList.length
                if(item.replyList.length>req.query.replyPageSize){
                    item.replyList.length=req.query.replyPageSize
                }
                item.replyList = {data:item.replyList,replyCount:item.replyCount}
                
                item.liked = utils.getLikedData(item.liked,user)
                item.replyList.data.forEach(value=>{
                    value.liked = utils.getLikedData(value.liked,user)
                })
            })
            return res.send({code:0,msg:'查询成功',data:result,total:data[1].total,totalPage:data[1].totalPage})
            
    })
})
// 增加回复
router.post('/addReply',function(req,res){
    let result = utils.getUserId(req.headers.token)
    new replyList({
        commentId:req.body.commentId,
        from: result,
        to: req.body.toUserId,
        content: req.body.content,
        createTime:req.body.createTime
    }).save().then((doc)=>{
        noteComment.findOne({_id:req.body.commentId})
        .then((data)=>{
            let replyList = data.replyList;
            replyList.unshift(doc._id)
            noteComment.updateOne({_id:req.body.commentId},{replyList:replyList})
            .then(v=>{
                return res.send({code:0,msg:'回复成功',data:doc})
            }).catch(err=>{
                return res.send({code:1,msg:'回复失败'})
            })
        })
    }).catch(err=>{
        return res.send({code:1,msg:'添加回复失败'})
    })
})
// 获取更多回复
router.get('/getMoreReply',function(req,res){
    let user = utils.getUserId(req.headers.token)
    let pageData = utils.transData(req.query.pageData)
    replyList.find({commentId:req.query.commentId},null, { skip:(pageData.page-1)*pageData.pageSize,limit:pageData.pageSize },function(err,data){
        let result = utils.transData(data)
        result.forEach(item=>{
            item.liked = utils.getLikedData(item.liked,user)
        })
        return res.send({code:0,msg:'查询成功',data:result,replyCount:data.length})
    })
})

// 获取评论所有回复
router.get('/getCommentInfo',function(req,res){
    let user = utils.getUserId(req.headers.token)
    let pageData = JSON.parse(req.query.pageData)
    noteComment.findById(req.query.commentId)
    .skip((pageData.page-1)*pageData.pageSize)
    .limit(pageData.pageSize)
    .then((doc)=>{
        let result = utils.transData(doc)
        result.liked = utils.getLikedData(result.liked,user)
        let totalPage = utils.getTotalPage(result.replyList.length,pageData.pageSize)
        result.replyList.forEach(item=>{
            item.liked = utils.getLikedData(item.liked,user)
        })
        let data={
            data:result.replyList,
            total:result.replyList.length,
            totalPage:totalPage,
            page:pageData.page
        }
        result.replyList = data
        return res.send({code:0,msg:'查询成功',data:result})
    })
})
// 评论点赞
router.post('/addCommentLike',function(req,res){
    // type:0评论点赞，1回复点赞
    let user = utils.getUserId(req.headers.token)
    let model
    if(req.body.type==0){
        model = noteComment
    }else{
        model = replyList
    }
    model.findOne({_id:req.body.id}).then((data)=>{
        let tempLiked = data.liked;
        let index = data.liked.indexOf(user)
        if(index>-1){
            tempLiked.splice(index, 1);
        }else{
            tempLiked.push(user)
        }
        model.updateOne({_id:req.body.id},{liked:tempLiked})
        .then(v=>{
            return res.send({code:0,msg:'操作成功',data:{result:index==-1?true:false,count:tempLiked.length}})
        }).catch(err=>{
            return res.send({code:1,msg:'操作失败'})
        })
    }).catch((err)=>{
        return res.send({code:1,msg:'评论查找错误',error:err})
    })
})
module.exports=router;