const { note, noteComment, replyList, menu, user } = require('../model/noteSch');
module.exports = {
    // 增加一条数据
    add(Model, Doc) {
        return new Promise(function (resolve, reject) {
            Model.create(Doc, function (err, doc) {
                if (err) {
                    reject(err)
                } else {
                    resolve(doc)
                }
            })
        })
    },
    // 增加多条数据
    addMany(Model, Docs) {
        // Model.insertMany(doc(s), [options], [callback])
        return new Promise(function (resolve, reject) {
            let ids = []
            for (let Doc of Docs) {
                Model.create(Doc, function (err, doc) {
                    if (err) {
                        this.deleteMany(Model, ids)
                        reject(err)
                        // TODO:打断循环
                        // break
                    } else {
                        ids.push(doc._id)
                    }
                })
            }
            resolve()
        })
    },
    // 按条件删除
    delete(Model, Query) {
        return new Promise(function (resolve, reject) {
            Model.remove(Query, function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    // 删除多条数据
    deleteMany(Model, Ids) {
        return new Promise(function (resolve, reject) {
            for (let id of Ids) {
                let promise = this.deleteById(Model, id)
                promise.then(function (result) {
                    // TODO:继续
                    // continue
                }, function (err) {
                    reject(err)
                })
            }
            resolve()
        })
    },
    // 按id删除
    deleteById(Model, Id) {
        return new Promise(function (resolve, reject) {
            Model.remove({ _id: Id }, function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    // 删除所有文档
    clear(Model) {
        return new Promise(function (resolve, reject) {
            Model.remove({}, function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    },
    // 按条件更新
    update(Model, Query, Doc, Options) {
        // 修改多条数据的时候的选项
        // Options={multi:true}
        return new Promise(function (resolve, reject) {
            Model.update(Query, { $set: Doc }, Options, function (err, doc) {
                if (err) {
                    reject(err)
                } else {
                    resolve(doc)
                }
            })
        })
    },
    // 按照id更新
    updateById(Model, id, Doc, Options) {
        return new Promise(function (resolve, reject) {
            Model.findByIdAndUpdate(id, { $set: Doc }, Options, function (err, doc) {
                if (err) {
                    reject(err)
                } else {
                    resolve(doc)
                }
            })
        })
    },
    // 按条件获取
    get(Model, Query, Select, Options) {
        // 模糊查询用正则表达式
        // MyModel.find({ name: /john/i }, 'name friends', function (err, docs) { })
        return new Promise(function (resolve, reject) {
            Model.find(Query, Select, Options, function (err, docs) {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    },
    // 按id获取
    getById(Model, Id, Select, Options) {
        return new Promise(function (resolve, reject) {
            Model.findById(Id, Select, Options, function (err, doc) {
                if (err) {
                    reject(err)
                } else {
                    resolve(doc)
                }
            })
        })
    },
    // 获取所有文档
    getAll(Model, Select) {
        return new Promise(function (resolve, reject) {
            Model.find({}, Select, {}, function (err, docs) {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    },
    // 获取分页数据
    page(Model, Query, pageIndex, pageSize,populate) {
        return Promise.all([
            new Promise(function (resolve, reject) {
                let start = (pageIndex - 1) * pageSize;
                let query = Model.find(Query);
                if(populate){
                    query.populate(populate)
                }
                query.skip(start);
                query.limit(pageSize);
                query.sort({_id: -1});
                //执行分页查询
                query.exec(function (err, docs) {
                    //分页后的结果
                    if (err) {
                        reject(err)
                    } else {
                        resolve(docs)
                    }
                })
            }),
            new Promise(function(resolve, reject){
                Model.countDocuments(Query, function (error, count) {
                    if (error) {
                        reject(error)
                    } else {
                        let totalPage
                        if(count>pageSize){
                            totalPage = (count % pageSize === 0) ? count / pageSize : Math.floor((count / pageSize) + 1);
                            count=pageSize
                        }else{
                            totalPage=1
                        }
                        resolve({total:count,totalPage:totalPage})
                    }
                })
            })
        ])

    },
    // 获取所有条数
    count(Model, query) {
        return new Promise(function (resolve, reject) {
            Model.countDocuments(query, function (err, count) {
                if (err) {
                    reject(err)
                } else {
                    console.log(count)
                    resolve(count)
                }
            })
        })
    }
} 