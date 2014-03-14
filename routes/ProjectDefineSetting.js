/**
 * 项目定义设置.
 * User: wdg
 * Date: 13-12-8
 * Time: 下午11:28
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/test?auto_reconnect');
var pdsCollection = db.collection('ProDefineSetting');
var _ = require('underscore');
/*
 *获取项目车型级别
 */
exports.getobj = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    pdsCollection.findOne(query, function (e, d) {
        if (d == null) {
            pdsCollection.save(query, function (re, rd) {
                res.jsonp(rd);
            });
        }
        else res.jsonp(d);
    });
};
exports.getobjs = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    pdsCollection.find(query, option).toArray(function (e, ds) {
        res.jsonp(ds);
    });
};
/*
 *获取项目车型级别
 */
exports.postupdateobj = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var id = req.body.id;
    var option = JSON.parse(req.body.option);
    pdsCollection.updateById(id, {$set: option}, function (e) {
        res.jsonp(id);
    });
};