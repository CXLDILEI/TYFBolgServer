const express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    JwtUtil = require('../jwt/jwt'),
    {user} =require('../model/userSch');
    const utils = require('../utils')
router.post('/register',(req,res)=>{
    user.find({userName:req.body.userName}).then(data=>{
        if(data.length>0){
            return res.send({code:1,msg:'用户已经存在'})
        }
        // 1. 指定用什么方式加密
        const c = crypto.createHash('sha256');
        // 2. 加密
        const password = c.update(req.body.password).digest('hex');
        user.create({
            userName:req.body.userName,
            password:password
        }).then(function (data) {
            return res.send({code:0,msg:'注册成功'});
        }).catch(function (err) {
            console.log(err);
        })
    }).catch(err=>{
        console.log(err);
    })
})
router.post('/login',(req,res)=>{
    user.find({userName:req.body.userName}).then(data=>{
        if(data.length>0){
           // 1. 指定用什么方式加密
            const c = crypto.createHash('sha256');
            // 2. 加密
            const loginPassword = c.update(req.body.password).digest('hex');
            if(loginPassword==data[0].password){
                let userData = utils.transData(data)
                let jwt = new JwtUtil(userData[0]._id);
                let token = jwt.generateToken();
                userData.forEach(e => {
                    delete e.password;
                })
                return res.send({code:0,data:userData,msg:'登录成功',token:token})
            }else{
                return res.send({code:1,msg:'密码错误'})
            }
        }else{
            return res.send({code:1,msg:'不存在改用户'})
        }
    }).catch(err=>{
        console.log(err);
    })
})
// 根据用户id查用户信息
router.get('/getUserById',function(req,res){
    let userId = utils.getUserId(req.headers.token);
    user.findOne({_id:userId},{password:0},function(err,data){
        if(!err){
            return res.send({code:0,data:data,msg:'查询成功'})
        }
        return res.send({code:1,msg:'查询失败',error:err})
    })
})
// 设置头像
router.post('/setUserAvatar',function(req,res){
    let userId = utils.getUserId(req.headers.token)
    user.findByIdAndUpdate(userId,{avatar:req.body.avatar},function(err,data){
        if(!err){
            return res.send({code:0,msg:'更新成功',data:data})
        }
        return res.send({code:1,msg:'更新失败',error:err})
    })
})
router.post('/changePsw',function(req,res){
    let userId = utils.getUserId(req.headers.token);
    console.log(req.body.data)
    let form = req.body.data
    form.oldPsw = form.oldPsw.replace(/\s*/g,"")
    form.newPsw = form.newPsw.replace(/\s*/g,"")
    form.aNewPsw = form.aNewPsw.replace(/\s*/g,"")
    if(form.oldPsw==''||form.newPsw==''||form.aNewPsw==''){
        return res.send({msg:'密码不能为空',code:1})
    }
    if(form.newPsw!==form.aNewPsw){
        return res.send({msg:'两次输入新密码不相同,请检查',code:1})
    }
    user.findById(userId,function(err,data) {
        console.log(data)
        const c = crypto.createHash('sha256');
        const loginPassword = c.update(data.password).digest('hex');
        console.log('loginPassword--------'+loginPassword)
    })
    // user.findByIdAndUpdate(userId,{},function(err,data){
    //     if(!err){
    //         return res.send({code:0,msg:'修改密码成功'})
    //     }
    //     return res.send({code:1,msg:'修改失败',error:err})
    // })
})
module.exports=router;
