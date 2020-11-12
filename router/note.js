const express = require('express'),
    {note} = require('../model/noteSch'),
    {user} = require('../model/userSch'),
    urlencode = require('urlencode'),
    router = express.Router();
const JwtUtil = require('../jwt/jwt');
const utils = require('../utils');
//添加笔记
router.post('/addNote', (req, res) => {
    let result = utils.getUserId(req.headers.token)
    let b = urlencode.decode(Buffer.from(req.body.content, 'base64').toString())
    let contnet = b.toString();
    let imgReg = /<img.*?(?:>|\/>)/gi; //匹配图片中的img标签
    let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;// 匹配图片中的src
    let arr = contnet.match(imgReg);  //筛选出所有的img
    let srcArr = [];
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            let src = arr[i].match(srcReg);
            // 获取图片地址
            srcArr.push({imgUrl: src[1]})
        }
    }
    note.create({
        title: req.body.title,
        content: req.body.content,
        textValue: req.body.textValue,
        imgList: srcArr,
        user: result
    }).then((data) => {
        return res.send({code: 0, msg: '添加成功'})
    }).catch(err => {
        return res.send({code: 1, msg: '添加出错'})
    })
});
// 更新笔记
router.post('/upDataNote', (req, res) => {
    if (!req.body.user) {
        return res.send({code: 1, msg: '添加出错,请检查用户状态'})
    }
    let b = urlencode.decode(Buffer.from(req.body.content, 'base64').toString())
    let contnet = b.toString();
    let imgReg = /<img.*?(?:>|\/>)/gi; //匹配图片中的img标签
    let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;// 匹配图片中的src
    let arr = contnet.match(imgReg);  //筛选出所有的img
    let srcArr = [];
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            let src = arr[i].match(srcReg);
            // 获取图片地址
            srcArr.push({imgUrl: src[1]})
        }
    }
    let upData = {
        title: req.body.title,
        content: req.body.content,
        textValue: req.body.textValue,
        imgList: srcArr,
        upDateTime: req.body.upDateTime
    }
    note.findByIdAndUpdate(req.body.noteId, upData, function (err, doc) {
        if (!err) {
            return res.send({code: 0, msg: '更新成功'})
        }
    })
});
//删除笔记
router.post('/deleteNote', (req, res) => {
    let result = utils.getUserId(req.headers.token)
    note.findById(req.body.id, function (err, doc) {
        if (doc.user._id == result) {
            note.deleteOne({_id: req.body.id}, function (err, result) {
                if (err) {
                    return res.send({code: 1, msg: '删除失败'})
                }
                return res.send({code: 0, msg: '删除成功'})
            })
        } else {
            return res.send({code: 1, msg: '只有文章作者才能删除！'})
        }
    })
})

//查询笔记列表
router.get('/getNoteList', (req, res) => {
    const {pageSize, page} = req.query;
    Promise.all([
        new Promise(function (next, err) {
            note.countDocuments({}, function (err, data) {
                if (data) {
                    next({length: data, totalPage: Math.ceil(data / pageSize)})
                }
            })
        }),
        new Promise((next, err) => {
            note.find().sort({createTime: -1}).skip((page - 1) * pageSize).limit(Number(pageSize)).then(function (data) {
                next(data)
            })
        })
    ]).then(data => {
        return res.send({
            data: {list: data[1], total: data[0].length, totalPage: data[0].totalPage},
            msg: '请求成功',
            code: 0
        })
    }).catch(err => {
        console.log(err)
    })
});
// 笔记详情
router.get('/getNoteDetail', (req, res) => {
    note.findOne({_id: req.query.id}).then((data) => {
        return res.send({code: 0, data: data})
    })
});
// 获取我的笔记列表
router.get('/getMyNoteList', (req, res) => {
    let pageData = JSON.parse(req.query.pageData)
    new Promise(function (resolve, reject) {
        note.find({user: req.query.userId}).then(function (data) {
            if (data) {
                resolve({length: data.length, totalPage: Math.ceil(data.length / pageData.pageSize)})
            }
        })
    }).then(function ({length, totalPage}) {
        note.find({user: req.query.userId}).sort({createTime: -1}).skip((pageData.page - 1) * pageData.pageSize).limit(pageData.pageSize).then(function (data) {
            return res.send({data: data, msg: '请求成功', code: 0, total: length, totalPage: totalPage})
        })
    })
});


module.exports = router;
















