var db = require('DB').DB;
var _ = require('underscore');
var async = require('async');
var G = require('SVC').G;
var ExtObjNumID = '562e60c8-6d0e-4926-9118-f1b14f3a0c85'; //王道代码
function checkQueryOption(option, tp) {
    option = typeof option == 'string' ? JSON.parse(option) : option;
    for (var _i in option) {
        option[_i] = parseInt(option[_i]);
    }
    var hasOps = _.keys(option).length > 0;
    if (hasOps && db.IBO[tp]) {
        option.Define = 1;
    }
    if (hasOps && db.ICommodity[tp]) {
        option.ExtObjNum = 1;
    }
}
function getdefineitems(obj, cb) {
    db.BODefine.find({'ParentID': obj._id}, {Name: 1, ValuePath: 1}).toArray(function (e, cs) {
        obj.Items = [];
        obj.Items.push(cs);
        async.each(cs, function (ci, ecb) {
            getdefineitems(ci, ecb);
        }, cb);
    });
}
exports.getdefinesihi = function (req, res) {
    var id = req.query['id'];
    db.find({'ParentID': id}, {Name: 1, ValuePath: 1}, function (e, ds) {
        async.each(ds, function (i, ecb) {
            getdefineitems(i, ecb);
        }, function (e) {
            res.jsonp(ds);
        });
    });
}
exports.getobjs = function (req, res) {
    var tp = req.query['tp'];
    var query = req.query['query'] || {};
    query = typeof query == 'string' ? JSON.parse(query) : query;
    var option = req.query['option'] || {};
    checkQueryOption(option, tp);
    db[tp].find(query, option).toArray(function (e, ds) {
        if (ds && ds.length > 0 && G.IBO[tp]) {
            _.each(ds, function (i) {
                i.ValuePath = _.find(global.BOs,function (ii) {
                    return ii._id == i.Define.Value;
                }).ValuePath;
            });
        }
        res.jsonp(ds);
    })
}
exports.getobj = function (req, res) {
    var tp = req.query['tp'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    checkQueryOption(option, tp);
    db[tp].findOne(query, option, function (e, d) {
        if (d && G.IBO[tp]) {
            d.ValuePath = _.find(global.BOs,function (i) {
                return i._id == d.Define.Value;
            }).ValuePath;
        }
        res.jsonp(d);
    })
};

function checkId(obj) {
    if (obj._id == undefined || obj._id == null || obj._id == '' || obj._id == '0') {
        obj._id = db.BODefine.ObjectID().toString();
    }
}
exports.postsave = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var tp = req.body['tp'];
    var obj = req.body['obj'];
    obj = typeof obj == 'string' ? JSON.parse(obj) : obj;
    if (obj._id) {
        var oid = obj._id;
        delete obj._id;
        db[tp].update({_id: oid}, {$set: obj}, function (e) {
            res.jsonp({msg: e == null, error: e, ID: oid});
        });
    }
    else {
        if (obj instanceof Array) {
            _.each(obj, function (i) {
                checkId(i);
            });
            db[tp].insert(obj, function (e, ds) {
                ds = _.map(ds, function (i) {
                    return {_id: i_id, Name: i.Name}
                });
                res.jsonp({msg: e == null, error: e, objs: ds});
            });
        }
        else {
            checkId(obj);
            db[tp].insert(obj, function (e, d) {
                res.jsonp({msg: e == null, error: e, ID: d._id});
            });
        }
    }

}
exports.postinsert = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var tp = req.body.tp;
    var obj = req.body.obj;
    obj = typeof  obj == 'string' ? JSON.parse(obj) : obj;
    var isAry = obj.length != undefined;
    if (isAry) {
        _.each(obj, function (i) {
            checkId(i);
        });
    }
    else {
        checkId(obj);
    }

    db[tp].insert(obj, function (e, d) {
        res.jsonp({msg: e ? false : true, ID: d ? d[0]._id : null, error: e});
    });
};
exports.postupdate = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var tp = req.body.tp;
    var m = req.body.m; //多重更新标志
    var option = req.body.option || {};
    var query = req.body.query;
    option = typeof option == 'string' ? JSON.parse(option) : option;
    query = typeof query == 'string' ? JSON.parse(query) : query;
    m = m ? JSON.parse(m) : {multi: false};
    var oid = query._id || option._id;
    delete option._id;
    db[tp].update(query, option, m, function (e) {
        res.jsonp({msg: e ? false : true, ID: oid, error: e});
    });
};
exports.delete = function (req, res) {
    var query = req.query['query'];
    var tp = req.query['tp'];
    db[tp].delete(query, function (e) {
        res.jsonp({msg: e ? false : true, error: e});
    });
};
exports.c = function (req, res) {
    db.CombinedObj.find({}).toArray(function (e, ds) {
        async.each(ds, function (co, cb) {
            async.each(co.Subjects, function (subject, cocb) {
                async.each(subject.Items, function (item, subjectcb) {
                    var tp = _.last(item.Obj.Item3.split('.'))
                    async.waterfall([
                        function (wcb) {
                            db[tp].findOne({_id: item.Obj.Item1}, {ExtObjNum: 1}, wcb);
                        },
                        function (n, wcb) {
                            item.ExtObjNum = n.ExtObjNum;
                            wcb(null);
                        }
                    ], subjectcb)
                }, cocb);
            }, function (e1) {
                db.CombinedObj.update({_id: co._id}, {$set: {Subjects: co.Subjects}}, cb);
            });
        }, function (e1) {
            res.json(ds);
        });
    })

}
exports.login = function (req, res) {
    var n = req.query['n'];
    var p = req.query['p'];
    db.Employee.findOne({Name: n, Pwd: p, flag: {$ne: 0}}, function (e, d) {
        res.jsonp(d);
    });
}


