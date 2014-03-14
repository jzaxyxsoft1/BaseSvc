/**
 * 车辆扩展
 * User: wdg
 * Date: 13-12-4
 * Time: 上午12:21
 */
var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/test?auto_reconnect');
var carCollection = db.collection('CarExt');
var _ = require('underscore');
exports.getobjs = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    carCollection.find(query, option).toArray(function (e, ds) {
        if (e) res.jsonp(e);
        else res.jsonp(ds);
    });
};

exports.getobjbyid = function (req, res) {
    var id = req.query['id'];
    var option = req.query['option'] || {};
    carCollection.findOne({ID: id}, option, function (e, d) {
        if (e) res.jsonp(e);
        else if (d == null) {
            carCollection.save({ID: id}, function (e, r) {
                res.jsonp(r);
            });
        }
        else {
            res.jsonp(d);
        }
    });
};
exports.getcarcartype = function (req, res) {
    var id = req.query['id'];
    var pid = req.query['pid'];
    carCollection.findOne({ID: id}, function (e, d) {
        if (d == null || d.CarTypes[pid] == undefined) res.jsonp(null);
        else res.jsonp(d.CarTypes[pid]);
    });
};
exports.postsavecarext = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var query = JSON.parse(req.body.query);
    carCollection.findById(query._id, function (e, car) {
        if (car == null) {
            carCollection.save(query, function (er, rnt) {
                if (er) res.send(er);
                else {
                    res.send(rnt._id);
                }
            })
        }
        else {
            var id = query._id;
            delete query._id;
            carCollection.updateById(id, query, function (e, d) {
                if (e) res.send(e);
                else res.send(id);
            });
        }
    });
};
/*
 更新车辆扩展部分属性
 */
exports.postupdatecarextpartial = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var query = req.body.query;
    var option = JSON.parse(req.body.option);
    carCollection.update(query, {$set: option}, {mutil: true}, function (e) {
        if (e) res.send(e);
        else res.send(true);
    });
};
/*检查车辆是否包含车型*/
exports.checkcartype = function (req, res) {
    var id = req.query['id'];
    var ct = req.query['ct'];
    var pid = req.query['pid'];
    carCollection.findOne({ID: id}, function (e, d) {
            if (d == undefined || d == null) {
                carCollection.save({ID: id, CarType: {}}, function () {
                    res.jsonp(true);
                });
            }
            else {
                if (d.CarTypes == undefined) d.CarTypes = {};
                if (d.CarTypes[pid] == undefined)d.CarTypes[pid] = ct;
                carCollection.updateById(d._id.toString(), {$set: {CarTypes: d.CarTypes}}, function (e) {
                    res.jsonp(true);
                });
            }
        }
    )
    ;


}
;
exports.delcarextbyid = function (req, res) {
    var id = req.query['id'];
    carCollection.removeById(id, function (e) {
        if (e) res.jsonp(e);
        else res.jsonp(true);
    });
};