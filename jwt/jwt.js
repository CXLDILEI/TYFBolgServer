const jwt = require('jsonwebtoken');
// 创建 token 类
class Jwt {
    constructor(data) {
        this.data = data;

    }

    //生成token
    generateToken() {
        let data = this.data;
        const secret = 'tyf19931014'; //撒盐：加密的时候混淆

        //jwt生成token
        const token = jwt.sign({
            userId: data
        }, secret, {
            expiresIn:  60*60*3 //一小时到期时间
        });
        return token;
    }

    // 校验token
    verifyToken(err) {
        let token = this.data;
        let secret = 'tyf19931014';//公钥 可以自己生成
        let res;
        try {
            jwt.verify(token, secret, function (err, decoded) {
                if (!err){
                    res = decoded.userId
                 }
            })
        } catch (e) {
            res = 'err';
        }
        return res;
    }
}

module.exports = Jwt;