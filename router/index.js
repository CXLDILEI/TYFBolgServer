const express = require('express'),
      router = express.Router()
const {menu} = require('../model/menuSch');
const JwtUtil = require('../jwt/jwt');
//获取所有菜单数据
router.get('/getPagesNumber',function(req,res){
    menu.find().then((data)=>{
        return res.send({total:data.length})
    })
})
router.get('/getAll', function (req, res) {
    if(Object.keys(req.query).length===0){
        menu.find().then((data)=>{
            return res.send({data:data,msg:'请求成功'})
        })
    }else{
        let page  = JSON.parse(req.query.pageData)||1
        let pageSize = 10
        menu.find().limit(pageSize).skip((page-1)*pageSize).then(function(data){
            return res.send({data:data,msg:'请求成功'})
        })
    }
});
//添加菜
router.post('/addMenu',function(req,res){
    menu.create({
        title:req.body.title,
        price:req.body.price
    }).then(function (data) {
        return res.send({code:0,msg:'添加成功'});
    }).catch(function (err) {
        console.log(err);
    })
})
//修改菜单
router.post('/updata',function(req,res){
    menu.updateOne({_id:req.body._id},{$set:{title:req.body.title,price:req.body.price}},function(err){
        return res.send({code:0,msg:'修改成功'})
    })
})
//删除菜单
router.post('/deleteMenu',function(req,res){
    menu.deleteOne({_id:req.body._id},function(result){
        return res.send({code:0,msg:'删除成功'})
    })
})
router.post('/searchValue',function (req,res) {
    menu.find({title:{$regex:req.body.searchvalue}}).then(function(result){
        return res.send({code:0,data:result})
    }).catch(function (err) {
        console.log(err)
    })

})
router.post('/checkToken',function(req,res){
    let dejwt = new JwtUtil(req.headers.token)
    let result = dejwt.verifyToken()
    // 如果考验通过就next，否则就返回登陆信息不正确
    if (!result||result=='err') {
        res.send({code: 403, msg: '登录已过期,请重新登录'});
    } else {
        res.send({code: 0, msg: '验证成功'});
    }
})
module.exports=router;