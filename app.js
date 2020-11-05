const express = require('express');
const app = express();
const mongoose = require('mongoose');
const JwtUtil = require('./jwt/jwt');
const bodyParser = require('body-parser');
const config= require('./assets/config')

mongoose.set('useFindAndModify', false)
//连接数据库
mongoose.Promise = global.Promise;
new Promise(function(reslove,reject){
    mongoose.connect(`mongodb://${config.MONGOOSE.AUTHOR}@127.0.0.1:27017/${config.MONGOOSE.DATABASE}`, {auto_reconnect: true,useNewUrlParser:true,useUnifiedTopology: true}, (err, client) => {
        if(err){
            reject(err)
        }else{
            reslove('数据库链接成功--有账号密码')
        }
    });
}).then((data)=>{
    console.log(data)
},(err)=>{
    mongoose.connect(`mongodb://localhost/${config.MONGOOSE.DATABASE}`,{useNewUrlParser:true,useUnifiedTopology: true}, (error, client) => {
        if(!error){
            console.log('数据库链接成功--无账号密码')
        }else{
            console.log('数据库链接失败',err)
        }
    });
}).catch(err=>{
    console.log(err)
})
//获取post请求

app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , X-token,Token,token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
    next();
});


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
//获取静态资源库
app.use('/static',express.static('public'));
app.use(function(req,res,next){
    if(req.method==='OPTIONS'){
        next();
    }
    // 不需要校验token的接口
    let valitArr = ['/user/login','/user/register','/note/getNoteList','/note/getNoteDetail','/comment/getComment','/getMoreReply']
    if(valitRouter(valitArr)){
        let dejwt = new JwtUtil(req.headers.token)
        let result = dejwt.verifyToken()
        // 如果考验通过就next，否则就返回登陆信息不正确
        if (!result||result=='err') {
            res.send({code: 403, msg: '登录已过期,请重新登录'});
        } else {
            next();
        }
    }else {
        next();
    }
    function valitRouter(arr){
        let result =true
        arr.forEach(item=>{
            if(req.url.indexOf(item)>-1){
                result = false
            }
        })
        return result
    }
})

//菜单接口
app.use('/',require('./router'));
//笔记传接口
app.use('/note',require('./router/note'));
// 用户接口
app.use('/user',require('./router/user'));
// 评论接口
app.use('/comment',require('./router/comment'))
app.listen(6025);
