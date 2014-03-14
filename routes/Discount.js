var mongo = require('mongoskin');
var db = require('DB').DB;
var discountC = db.CardDiscount;
var _ = require('underscore');
var async = require('async');
var cSvc = require('SVC').CommoditySvc;
exports.get = function (req, res) {
    var t = req.query['t'];
    switch (t) {
        case 'obj':
            var tp = req.query['tp'];
            var id = req.query['id'];
            var option=req.query['option']||{};
            cSvc.getCommodity(tp, {_id: id} ,option, function (e, obj) {
                var bo = _.find(global.BOs,function (i) {
                    return i._id == obj[0].Define.Value;
                }).ValuePath;
                var vps = _.compact(bo.split('/')).reverse();
                discountC.find({"RelativeObj.Item1": {$in: vps}}).toArray(function (e, dis) {
                    for (var ii = 0; ii < vps.length; ii++) {
                        var l = _.find(dis, function (di) {
                            return di.RelativeObj.Item1 == vps[ii];
                        });
                        if (l == null) {
                            continue;
                        }
                        else {
                            res.jsonp(l.Items);
                            return;
                        }
                    }
                    res.jsonp(null);
                });
            });
            break;
        case 'objs':
            var query = req.query['query'];    //[{tp:'',ids:['string']}]
            var r = [];
            async.each(query,
                function (obj, cb) {
                    async.each(obj.ids, function (oid, dcb) {
                        getObjDiscounts(obj.tp, {_id:oid}, function (e,d) {
                            r= _.union(r,d);
                            dcb(null);
                        })
                    }, function () {
                        cb();
                    });
                }, function (e, rs) {
                    res.jsonp(r);
                });
            break;
    }
};

function getObjDiscounts(tp, query, cb) {
    cSvc.getMaterails(tp, query, {Define: 1}, function (e, objs) {
        if (objs == null) {
            cb(null);
            return;
        }
        var r = [];
        async.each(objs,
            function (obj, scb) {
                var bo = _.find(global.BOs,function (i) {
                    return i._id == obj.Define.Value;
                }).ValuePath;
                var vps = _.compact(bo.split('/')).reverse();
                db.CardDiscount.find({"RelativeObj.Item1": {$in: vps}}).toArray(function (e, dis) {
                    for (var ii = 0; ii < vps.length; ii++) {
                        var l = _.find(dis, function (di) {
                            return di.RelativeObj.Item1 == vps[ii];
                        });
                        if (l == null) {
                            continue;
                        }
                        else {
                            r.push({id:obj._id,items: l.Items});
                        }
                    }
                    scb(null);
                });
            },
            function () {
                cb(null, r);
            });
    });
}