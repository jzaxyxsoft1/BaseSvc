/**
 * Created with JetBrains WebStorm.
 * User: wdg
 * Date: 13-12-17
 * Time: 上午2:51
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongoskin');
var baseDB = mongo.db('localhost:4000/ECTABase?auto_reconnect');
var bdCollection = baseDB.collection('BODefine');
var brCollction = baseDB.collection('Brand');
var atCollection = baseDB.collection('AutoArticles');
var bvID = '7f8cb328-889c-4858-05cb-f20272f007e7';
var dfID = '5287c3e4ca092210e49d9817';
var tpCollection = mongo.db('localhost:4000/test?auto-reconnect').collection('TierPattern');
var _ = require('underscore');
var async = require('async');
exports.init = function (req, res) {
    async.waterfall([
        function (cb) {
            brCollction.find({Ranges:{$elemMatch:{id:dfID}}}, {Name: 1}).toArray(cb);
        },
        function (ds, cb) {
            var _ids = _.map(ds, function (i) {
                return i._id;
            });
            atCollection.find({'ExtProperties.BrandID': {$in: _ids}}, {'Properties.7cfd275b-6d06-46b0-03d5-15ca5a74027e': 1, 'ExtProperties.BrandID': 1}).toArray(function (e, rs) {
                var kk = _.chain(rs)
                    .map(function (i) {
                        return {BrandID: i.ExtProperties.BrandID, HW: i.Properties['7cfd275b-6d06-46b0-03d5-15ca5a74027e'].Value};
                    }).groupBy(function (i) {
                        return i.BrandID
                    }).value();
                for (var i in kk) {
                    var ps = _.map(kk[i], function (l) {
                        return l.HW;
                    });
                    ps = _.uniq(ps);
                    var br = _.find(ds, function (di) {
                        return di._id == i;
                    });
                    br.Items = ps;
                }
                cb(null, ds);
            });
        }
    ], function (e, rts) {
        res.jsonp(rts);
    });
};
exports.getobjs = function (req, res) {
    var query = req.query['query'];
    tpCollection.find(query).toArray(function (e, rs) {
        res.jsonp(rs);
    });
};
exports.getobj = function (req, res) {
    var query = req.query['query'];
    tpCollection.findOne(query, function (e, ds) {
        if (ds == null) {
            query.Imgs = [];
        }
        res.jsonp(ds || query);
    });
};
exports.postsaveobj = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var o = req.body.o;
    if (o._id) {
        tpCollection.update({_id: o._id}, {$set: {Imgs: o.Imgs}}, function (e) {
            res.send(o._id);
        });
    }
    else {
        o._id= tpCollection.ObjectID().toString();
        tpCollection.insert(o, function (e, ds) {
            res.send(ds[0]._id.toString());
        })
    }
};
