/**
 * Created with JetBrains WebStorm.
 * User: wdg
 * Date: 13-11-30
 * Time: 下午1:25
 * 项目保养周期设置
 */
var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/test?auto_reconnect');
var Project = mongo.db('localhost:4000/ECTABase?auto_reconnect').collection('Project');
var ppCollection = db.collection('ProjectPeriod');
var cppCollection = db.collection('CarTypeProjectPeriod');
var async = require('async');
var _ = require('underscore');
exports.getpp = function (req, res) {
    var query = req.query['query'];
    var brr = req.query['withCTs'];
    ppCollection.findOne(query, function (err, doc) {
        if (err)res.jsonp(err);
        else {
            if (brr) {
                var rr = {Obj: doc};
                cppCollection.find({DefineID: doc.ID}, function (e, ds) {
                    if (e) res.jsonp(e)
                    else {
                        rr.CarTypes = ds;
                        res.jsonp(rr);
                    }
                });
            }
            else {
                res.jsonp(doc);
            }
        }
    });
};
exports.getpp = function (req, res) {
    var query = req.query['query'];
    var brr = req.query['withCTs'];
    ppCollection.findOne(query, function (err, doc) {
        if (err)res.jsonp(err);
        else {
            if (brr) {
                var rr = {Obj: doc};
                cppCollection.find({DefineID: doc._id.toString()}).toArray(function (e, ds) {
                    if (e) res.jsonp(e)
                    else {
                        rr.CarTypes = ds;
                        res.jsonp(rr);
                    }
                });
            }
            else {
                res.jsonp(doc);
            }
        }
    });
};
exports.getpps = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    ppCollection.find(query, option).toArray(function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
};
exports.postsavepp = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var o = JSON.parse(req.body.query);
    if (o._id == '' || o._id == '0') {
        o._id = o._id == '' || o._id == '0' ? ppCollection.ObjectID() : o._id;
        o.ID = o._id.toString();
        ppCollection.insert(o, function (e, docs) {
            if (e) res.send(e);
            else res.send(docs[0].ID);
        });
    }
    else {
        ppCollection.updateById(o._id, o, function (e) {
            if (e) res.send(e);
            else res.send(o.ID);
        });
    }

    ppCollection.remove({ID: o.ID}, function (er) {
        ppCollection.insert(o, function (err, docs) {
            if (err) res.send(err);
            else res.send(docs[0].ID);
        })
    });
};
exports.delpp = function (req, res) {
    var query = req.query['query'];
    ppCollection.remove(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(true);
    })
};
exports.getcpp = function (req, res) {
    var query = req.query['query'];
    cppCollection.findOne(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    });
};
exports.getcpps = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};

    cppCollection.find(query, option).toArray(function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    });

};

exports.postsavecpp = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var query = JSON.parse(req.body.query);
    var _ids = _.map(query, function (i) {
        return i._id || '';
    });
    cppCollection.remove({_id: {$in: _ids}}, function (fe) {
        cppCollection.insert(query, function (ie, docs) {
            if (ie)res.send(ie);
            else res.send('true');
        });

    });

};
exports.delcpp = function (req, res) {
    var query = req.queryp['id'];
    cppCollection.removeById(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
};
/*
 *根据公里数获取项目周期
 * 参数:
 *  ct:车型ID
 *  m:公里数字符
 */
exports.getppbymileage = function (req, res) {
    var ct = req.query['ct'];
    var m = parseInt(req.query['m']);
    var tmp;
    async.waterfall([
        function (cb) {
            cppCollection.find({Value: ct}).toArray(function (e, cpps) {
                if (cpps == null) {
                    tmp = getStandardPPByMileage(ct, m, function (r) {
                        cb(null, r);
                    });
                }
                else {
                    tmp = _.filter(cpps, function (i) {
                        return i.Mileage > m;
                    });
                    if (tmp.length == 0) {
                        getStandardPPByMileage(ct, m, function (r) {
                            cb(null, r);
                        });
                    }
                    else {
                        tmp = _.sortBy(tmp, function (i) {
                            return i.Mileage;
                        })[0];
                        ppCollection.findById(tmp.DefineID, cb);
                    }
                }
            });
        },
        function (pp, cb) {
            var dids = pp.BYItems;
            Project.find({_id: {$in: dids}}, {Name: 1, Define: 1, Properties: 1}).toArray(function (e, ds) {
                _.each(ds, function (i) {
                    i.TypeFullName = 'ACS.Commodities.Project';
                    i.ValuePath = _.find(global.BOs,function (bi) {
                        return bi._id == i.Define.Value;
                    }).ValuePath;
                });
                cb(null, {pp: pp, pros: ds});
            });
        }
    ], function (e, rs) {
        res.jsonp(rs);
    });

};
/*用公里数获取标准项目周期
 * ct:车型ID
 * m:公里数 int
 * cb:回调(项目周期对象实例)
 * */
function getStandardPPByMileage(ct, m, cb) {
    ppCollection.find({Mileage: {$gt: m}, isStandard: true}).sort({Mileage: 1}).toArray(function (e, pps) {
        cb(pps.length == 0 ? null : pps[0]);
    });
}
