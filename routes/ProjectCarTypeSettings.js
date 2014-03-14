/**
 *项目车型标准设置
 * User: wdg
 * Date: 13-12-7
 * Time: 上午11:33
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/test?auto_reconnect');
var defCollection = db.collection('ProjectCarTypeSettingDefine');
var carTypeCollection = db.collection('ProjectCarTypeSetting');
var _ = require('underscore');
exports.getdefinebyid = function (req, res) {
    var query = req.query['id'];
    var option = req.query['option'] || {};
    defCollection.findOne(query, option, function (e, doc) {
        res.jsonp(doc);
    });
};

exports.getdefinebyid = function (req, res) {
    var query = req.query['id'];
    var option = req.query['option'] || {};
    defCollection.findOne({ProjectID: query}, option, function (e, doc) {
        if (doc == null) {
            defCollection.save({ProjectID: query }, function (err, rtn) {
                res.jsonp(rtn);
            });
        } else {
            res.jsonp(doc);
        }
    });
};
exports.postupdatedefinebyid = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var id = req.body.id;
    var option = JSON.parse(req.body.option);
    defCollection.updateById(id, {$set: option}, function (e) {
        res.send(id);
    });

};

exports.getpctst = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    carTypeCollection.findOne(query, option, function (e, doc) {
        if (doc == null) {
            carTypeCollection.save(query, function (err, rtn) {
                res.jsonp(rtn);
            });
        } else {
            res.jsonp(doc);
        }
    });
};
exports.postupdatappctstbyid = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var id = req.body.id;
    var option = JSON.parse(req.body.option);

    carTypeCollection.updateById(id, {$set: option}, function (e) {
        res.send(id);
    });
};
exports.getpdnpctst = function (req, res) {
    var query = req.query['query'];
    defCollection.findOne({ProjectID: query.ProjectID}, function (e, df) {
        if (df == null)   res.jsonp(null);
        else {
            if (query.CarTypeID) {
               var pl = query.CarTypeID.split('/');
                _.each(pl,function(i){ i=i+'/';});
                query.CarTypeID = {$in:pl};
            }
            carTypeCollection.findOne(query,function (ce, cts) {
                res.jsonp({define: df, ctsts: cts});
            });
        }
    });
};