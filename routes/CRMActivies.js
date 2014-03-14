/**
 * Created with JetBrains WebStorm.
 * User: wdg
 * Date: 13-12-21
 * Time: 下午2:12
 * To change this template use File | Settings | File Templates.
 */
var _ = require('underscore');
var async = require('async');
var db = require('DB').DB;
var Helper = require('Svc').Helper;
var BaseSvc = require('Svc').BaseSvc;
exports.get = function (req, res) {
    var t = req.query['t'];
    var query = req.query['query'];
    query = typeof query == 'string' ? JSON.parse(query) : query;
    var option = req.query['option']||{};
    Helper.convertOption(option);
    switch (t) {
        case 'reserve':
            res.render('Activities/reserve.ejs')
            break;
        case 'obj':
            db.CRMActivity.findOne(query, option, function (e, r) {
                res.json(r);
            })
            break;
        case 'objswithimg':
            var  oids=[],mids=[];
            db.CRMActivity.find(query).toArray(function (e, ds) {

                ds.forEach(function (act){
                    var _ps = act.Projects.map(function (i){ return i.RelativeObj.Item1;  });
                    var _ms = act.Materials.map(function (i){return i.RelativeObj.Item1});
                   oids = _.union(_ps,oids);
                    oids = _.union(_ms,oids);
                });
                db.Media.find({ObjID:{$in:oids}}).toArray(function (e,medias){
                       _.each(ds,function (act){
                           _.each(act.Projects,function (i){
                               var _m= _.find(medias,function (mi){return mi.ObjID== i.RelativeObj.Item1});
                               i.img =_m? _m.Url:'http://image.jzaxyx.com/Projects/DefaultProject.png';
                           })
                           _.each(act.Materials,function (i){
                               var _m= _.find(medias,function (mi){return mi.ObjID== i.RelativeObj.Item1});
                               i.img =_m? _m.Url:'http://image.jzaxyx.com/Projects/DefaultMaterial.png';
                           })
                       });
                        res.json(ds);
                    }
                );
            });
            break;
        case 'objs':
            db.CRMActivity.find(query, option).toArray(function (e, ds) {
                res.json(ds);
            });
            break;
        case 'actitemreserve': // 活动条目预约
            var id = req.query['id']; //活动id
            var idx = Number(req.query['idx']); //条目索引
            var it = req.query['it']; //条码类型 'p':Project,'m':Material
            var customerTel = req.query['ctel'];//客户电话
            var itm;
            async.waterfall(
                [
                    //检查黑名单
                    function (cb) {
                        db.ReservationBlackList.findOne({Num: customerTel}, function (e, obj) {
                            if (obj) {
                                cb('预约失败')
                            }
                            else {
                                cb(null);
                            }
                        });
                    },
                    function (cb) {
                        db.CRMActivity.findOne({_id: id}, cb);
                    },
                    function (act, cb) {
                        itm = it == 'p' ? _.find(act.Projects, function (obj) {
                            return obj.idx == idx
                        }) : _.find(act.Materials, function (obj) {
                            return obj.idx == idx
                        });
                        if (itm.Active) {
                            itm.CustomerTel = customerTel;
                            itm.Active = false;
                            cb(null, act);
                        }
                        else {
                            cb('已被预约');
                        }
                    }
                ],
                function (e, act) {
                    if (e) {
                        res.json({msg: false, error: e});
                    }
                    else {
                        async.parallel(
                            {
                                更新: function (cb) {
                                    db.CRMActivity.update({_id: act._id}, {$set: {Projects: act.Projects, Materials: act.Materials}}, cb);
                                },
                                通知: function (cb) {
                                    var 微信ID = act.WXID;
                                    var msg = '客户:' + customerTel + '预约' + (itm.BTime ? itm.BTime + '到' + itm.ETime + '时段的' : '') + itm.RelativeObj.Item2;
                                    //发送信息

                                    cb(null);
                                }
                            },
                            function (e) {
                                res.json({msg: e == null, error: e})
                            }
                        )
                    }
                }
            )
            break;
        case 'actitemcancel': //预约终止
            var id = req.query['id']; //活动id
            var it = req.query['it']; //条目类型 p:Project,m:Material
            var idx = Number(req.query['idx']); //条目索引
            var bl = req.query['bl']; //如果不为空将电话加入预约黑名单
            db.CRMActivity.findOne({_id: id}, function (e, act) {
                var itm = it == 'p' ? _.find(act.Projects, function (obj) {
                    return obj.idx == idx
                }) : _.find(act.Materials, function (obj) {
                    return obj.idx == idx
                });
                itm.Active = true;
                itm.CustomerTel = '';
                async.parallel(
                    {
                        更新: function (cb) {
                            db.CRMActivity.update({_id: act._id}, {$set: {Projects: act.Projects, Materials: act.Materials}}, cb);
                        },
                        黑名单: function (cb) {
                            if (bl) {
                                db.ReservationBlackList.findOne({Num: itm.CustomerTel}, function (e, obj) {
                                    if (obj == null) {
                                        db.ReservationBlackList.insert({_id: db.ReservationBlackList.ObjectID().toString(), Num: itm.CustomerTel}, cb);
                                    }
                                })
                            }
                            else {
                                cb(null)
                            }
                        }
                    },
                    function (e) {
                        res.jsonp({msg: e == null, error: e});
                    }
                )

            })
            break;
    }
};
exports.post = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    if (!req.body.query) {
        var o = JSON.parse(req.body.o);
        if (o._id && o._id != '' && o._id != '0') {
            var _i = o._id;
            delete o._id;
            db.CRMActivity.update({_id: _i}, o, function (e, r) {
                res.jsonp({msg: true, ID: _i});
            });
        } else {
            o._id = act.skinDb.ObjectID().toString();
            act.insert(o, function (e, rs) {
                res.jsonp({msg: true, ID: rs[0]._id});
            });
        }
    } else {
        var option = JSON.parse(req.body.option);
        db.CRMActivity.update(req.body.query, {$set: option}, function (e) {
            res.jsonp({msg: true});
        });
    }
}
