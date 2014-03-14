var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/ECTABase?auto_reconnect');
var Setting = db.collection('ProjectSetting');
var ProjectC = db.collection('Project');
var AutoPartC = mongo.db('localhost:4000/test?auto_reconnect').collection('AutoPart');
var AutoArticleC = db.collection('AutoArticles');
var _ = require('underscore');
var async = require('async');
var tool = require('Tools').Tools;
exports.get = function (req, res) {
    var t = req.query['t'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    option= typeof option=='string'?JSON.parse(option):option;
    switch (t) {
        case 'obj':
            Setting.findOne(query, option, function (e, d) {
                d.TypeFullName = {};
                if (d.RelativeMaterialTypes) {
                    _.each(d.RelativeMaterialTypes, function (i) {
                            d.TypeFullName[i.Value] = tool.GetCollectionNameFromBODefine(i.Value);
                    });
                }
                res.jsonp(d);
            });
            break;
        case 'objs':
            Setting.find(query, option).toArray(function (e, ds) {
                _.each(ds, function (d) {
                    d.TypeFullName = {};
                    if (d.RelativeMaterialTypes) {
                        _.each(d.RelativeMaterialTypes, function (i) {
                            d.TypeFullName[i.Value] = tool.GetCollectionNameFromBODefine(i.Value);
                        });
                    }
                })
                res.jsonp(ds);
            });
            break;

    }
}
