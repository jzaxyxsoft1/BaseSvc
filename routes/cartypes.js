/**
 * 车型控制器
 * User: wdg
 * Date: 13-11-13
 * Time: 上午2:11
 * To change this template use File | Settings | File Templates.
 */
var db = require('mongoskin').db('http://localhost:4000/test')
    , carimgs = db.collection('carimgs'),
    carTypelogo = db.collection('CarTypeLog'),
    carTypeSetting = db.collection('CarTypeSetting'),
    CarTypeArea = db.collection('CarTypeArea'),
    carType = db.collection('CarType'),
    ProjectCarTypeLvl = db.collection('ProjectCarTypeLvl'),
    async=require('async'),
    _=require('underscore');


exports.getobjs = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};

    carType.find(query, option).toArray(function (err, docs) {
        if (err)res.jsonp(err);
        else res.jsonp(docs);
    })
}


exports.getdata = function (q, r) {
    var t = q.query['t'];
    t = t.toLowerCase();
    switch (t) {
        case 'getcartypeimg':            //获取车型图片
            var id = q.query['id'];
            carimgs.findOne({_id: id}, function (err, doc) {
                r.jsonp(doc);
            });
            break
        case 'savecartypeimg':        //保存车型图片
            var o = q.query['o'];
            carimgs.save(o, function (e, d) {
                r.jsonp(true);
            });
            break;
        case 'getcartypesetting':     //获取车型设置
            var id = q.query['id'];
            carTypeSetting.findOne({_id: id}, function (err, doc) {
                r.jsonp(doc);
            });
            break
        case 'getcartypesettings':     //获取车型设置集合
            var o = q.query['o'];
            carTypeSetting.find(o).toArray(function (e, d) {
                r.jsonp(d);
            });
            break
        case 'savecartypesetting':                  //保存车型设置
            var o = q.query['o'];
            carTypeSetting.save(o, function (e, d) {
                r.jsonp(true);
            });
            break
        case 'getcartypeareas':            //获取车型地区集合
            CarTypeArea.find().toArray(function (e, d) {
                r.jsonp(d);
            });
            break;
        case 'getcartypelogo':               //获取车型Logo
            var id = q.query['id'];
            carTypelogo.findOne({_id: id}, function (e, d) {
                r.jsonp(d);
            });
            break;
        case 'getcartypelogos':               //获取车型Logo
            var o = q.query['o'];
            carTypelogo.find(o).toArray(function (e, d) {
                r.jsonp(d);
            });
            break;
        case 'savecartypelogo': //保存车型logo
            var o = q.query['o'];
            carTypelogo.save(o, function (e, d) {
                r.jsonp(true);
            });
            break;
        case 'savecartypeareas':       //保存车型地区集合
            var o = q.query['o'];
            CarTypeArea.remove({}, function (e, d) {
                CarTypeArea.insert(o, function (e, d) {
                    r.jsonp(d);
                });
            });

            break;
    }
}

