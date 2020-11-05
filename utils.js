const JwtUtil = require('./jwt/jwt');
module.exports = {
    filterValue: function (data, filters) {
        let value = JSON.parse(JSON.stringify(data))
        for (let key in value) {
            filters.forEach(filter => {
                if (key == filter) {
                    delete value[filter]
                }
            })
        }
        return value
    },
    getTotalPage: function (length, pageSize) {
        let totalPage
        if (length > pageSize) {
            totalPage = (length % pageSize === 0) ? length / pageSize : Math.floor((length / pageSize) + 1);
            length = pageSize
        } else {
            totalPage = 1
        }
        return totalPage
    },
    getLikedData: function (arr, user) {
        let liked = {
            isLiked: false,
            likedCount: 0
        }
        if (arr.length > 0) {
            arr.forEach(value => {
                if (value == user) {
                    liked.isLiked =  true
                }
                liked.likedCount=arr.length
            })
        }else{
            liked = {
                isLiked: false,
                likedCount: 0
            }
        }
        return liked
    },
    transData(data){
        let result
        try{
            result = JSON.parse(JSON.stringify(data))
        }
        catch(err){
            throw(err)
        }
        return result
    },
    getUserId(token,err){
        let dejwt = new JwtUtil(token)
        return dejwt.verifyToken(err)
    }
}