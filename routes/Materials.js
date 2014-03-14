var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/ECTABase?auto_reconnect');
var AutoPart = mongo.db('localhost:4000/test?auto_reconnect').collection('AutoPart');
var AutoArticle = db.collection('AutoArticles');
var Project = db.collection('Project');
var Price = db.collection('Price');
var _ = require('underscore');
var async = require('async');
exports.getobjs = function (req, res) {
    var t = req.query['t'];
    var query = JSON.parse(req.query['query']);
    var option = req.query['option'] || {};
    var p = req.query['p'];
    if (p) {
        async.waterfall([
            function (cb) {
                getMaterails(t, query, option, cb);
            },
            function (objs, cb) {
                var ids = _.map(objs, function (i) {
                    return i._id;
                });
                Price.find({"RelativeObj.Item1": {$in: ids}}).toArray(function (e, ds) {
                    _.each(objs, function (oi) {
                        var pi = _.find(ds, function (pri) {
                            return pri.RelativeObj.Item1 == oi._id;
                        });
                        oi.Price = pi == null ? 0 : pi.DefaultPrice;
                    });
                    res.jsonp(objs);
                });
            }
        ], function (e, ds) {
            res.jsonp(ds);
        });
    }
    else {
        getMaterails(t, query, option, function (e, ds) {
            res.jsonp(ds);
        });
    }
};
exports.getobjsac = function (req, res) {
    var term = req.query['term'].trim().toUpperCase();
    var q = {$or: [
        {Name: {$regex:term}},
        {Simcode:{$regex:term}}
    ]}
    async.parallel(
        {
            autoPart: function (cb) {
                AutoPart.find(q, {Name: 1,Define:1,Model:1}).toArray(function(e,ds){
                    ds  = _.map(ds, function (i){ return {ID:i._id,Name:i.Name,TypeFullName:'AutoPart',label:'【'+i.Define.Name+'】'+ i.Name+' '+ i.Model||'',value:i.Name}});
                    cb(e, ds);
                });
            },
            articles: function (cb) {
                AutoArticle.find(q, {Name: 1,Define:1,Model:1}).toArray(function(e,ds){
                    ds  = _.map(ds, function (i){ return {ID:i._id,Name:i.Name,TypeFullName:'AutoPart',label:'【'+i.Define.Name+'】'+ i.Name+' '+ i.Model||'',value:i.Name}});
                    cb(e, ds);
                });
            }
        },
        function (e, result) {
            var r = _.union(result.autoPart,result.articles);
            res.jsonp(r);
        })
}
function getMaterails(t, query, option, cb) {
    switch (t) {
        case 'AutoPart':
            AutoPart.find(query, option).toArray(function (e, rs) {
                _.each(rs, function (i) {
                    i.ValuePath = _.find(global.BOs,function (ii) {
                        return ii._id == i.Define.Value;
                    }).ValuePath;
                });
                cb(null, rs);
            });
            break;
        case 'AutoArticles':
            AutoArticle.find(query, option).toArray(function (e, rs) {
                _.each(rs, function (i) {
                    i.ValuePath = _.find(global.BOs,function (ii) {
                        return ii._id == i.Define.Value;
                    }).ValuePath;
                });
                cb(null, rs);
            });
            break;
        case 'Project':
            Project.find(query, option).toArray(function (e, rs) {
                _.each(rs, function (i) {
                    i.ValuePath = _.find(global.BOs,function (ii) {
                        return ii._id == i.Define.Value;
                    }).ValuePath;
                });
                cb(null, rs);
            });
            break;
    }
}


