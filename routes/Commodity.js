var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/ECTABase?auto_reconnect');
var db1 = mongo.db('localhost:4000/test?auto_reconnect');
var ProjectSetting = db.collection('ProjectSetting');
var CarTypeClasses = db.collection('CarTypeClass');
var AutoPart = db1.collection('AutoPart');
var AutoArticle = db.collection('AutoArticles');
var Project = db.collection('Project');
var PriceC = db.collection('Price');
var Combined = db.collection('Combined');
var _ = require('underscore');
var async = require('async');
var tool = require('Tools').Tools;
function checkQueryOption(option, tp) {
    option = typeof option == 'string' ? JSON.parse(option) : option;
    for (var _i in option) {
        option[_i] = parseInt(option[_i]);
    }
    var hasOps = _.keys(option).length > 0;
    if (hasOps && db.IBO[tp]) {
        option.Define = 1;
    }
    if (hasOps && db.ICommodity[tp]) {
        option.ExtObjNum = 1;
    }
}
exports.getcommodity = function (req, res) {
    var t = req.query['t'];
    var tp = req.query['tp'];
    var option = req.query['option'];
    var query = JSON.parse(req.query['query']);
    getCommodity(tp, query, option, function (ds) {
        res.jsonp(ds);
    })
};
exports.getprice = function (req, res) {
    var t = req.query['t'];
    var tp = req.query['tp'];
    var option = req.query['option'] || {};
    checkQueryOption(option, tp);
    var query = req.query['query'];
    query = typeof query == 'string' ? JSON.parse(query) : query;
    var ct = req.query['ct'];
    async.waterfall([
        function (cb) {
            var qo = query;
            if (tp != 'Project') {
                qo.flag = 1;
            }
            getCommodity(tp, qo, option, function (e, ds) {
                if (ct && tp != 'Project') {
                    var lls = _.filter(ds, function (i) {
                        return i.IsComm || _.any(i.CarTypes, function (ci) {
                            return ci.Value.indexOf(ct) > -1 || ct.indexOf(ci.Value) > -1;
                        })
                    });
                    ds = lls;
                }
                _.each(ds, function (i) {
                    i.ValuePath = tool.GetCommodityValuePath(i);
                    delete i.CarTypes;
                });
                cb(null, ds);
            });
        },
        function (objs, cb) {
            var ids = _.chain(objs).map(function (i) {
                return i._id;
            }).uniq().value();
            PriceC.find({"RelativeObj.Item1": {$in: ids}}).toArray(function (e, ds) {
                _.each(objs, function (i) {
                    i.Price = _.find(ds, function (pri) {
                        return pri.RelativeObj.Item1 == i._id;
                    });
                    i.Price = i.Price || {DefaultPrice: 0, CarTypePrice: 0};
                });
                cb(null, objs);
            });
        }
    ], function (e, objs) {
        if (ct && tp == 'Project') {
            async.waterfall([
                function (scb) {
                    var ranges = new Array();
                    _.each(objs, function (i) {
                        ranges.push(_.compact(i.ValuePath.split('/')));
                        ranges.push(i.Define.Value + '_' + i._id);
                    });
                    ranges = _.chain(ranges).flatten().uniq().value();

                    var cts = tool.CreateValuePathArray(ct, '/');
                    CarTypeClasses.find({Range: {$in: ranges}}).toArray(function (e, rs) {
                        var ttls = _.filter(rs, function (i) {
                            return _.any(i.CarTypes, function (ii) {
                                return ii.Value.indexOf(ct) > -1 || ct.indexOf(ii.Value) > -1;
                            })
                        });
                        scb(null, ttls);
                    });
                },
                function (cartypeclasses, scb) {
                    _.each(objs, function (i) {
                        if (i.Price) {
                            i.Price.CarTypePrice = i.Price.DefaultPrice;
                            if (i.Price.CarTypeClasses.length > 0) {
                                var _vp = i.ValuePath.replace(/\//g, '_') + i._id;
                                var ctc = _.filter(cartypeclasses, function (ctci) {
                                    return _vp.indexOf(ctci.Range) > -1
                                });
                                if (ctc.length > 0) {
                                    ctc = _.max(ctc, function (ctci) {
                                        return ctci.Range.length;
                                    });
                                    var pp = _.find(i.Price.CarTypeClasses, function (prii) {
                                        return prii.Item1 == ctc._id;
                                    });
                                    if (pp) {
                                        i.Price.CarTypePrice = eval(i.Price.DefaultPrice + pp.Item3 + pp.Item4);
                                    }
                                }
                            }
                        }
                        else {
                            i.Price = {DefaultPrice: 0, CarTypePrice: 0};
                        }
                    });
                    scb(null, objs);
                }
            ], function (e, rtnd) {
                _.each(objs, function (i) {
                    i.Price = {DefaultPrice: i.Price.DefaultPrice, CarTypePrice: i.Price.CarTypePrice};
                });
                res.jsonp(objs);
            });
        }
        else {
            _.each(objs, function (i) {
                if (i.Price.CarTypes && i.Price.CarTypes.length > 0 && _.any(i.CarTypes, function (ii) {
                    return ii.Value == ct;
                })) {
                    var _pi = _.find(i.CarTypes, function (ii) {
                        return ii.Value == ct;
                    });
                    i.Price = {DefaultPrice: i.DefaultPrice, CarTypePrice: _pi.Price};
                }
                else {
                    i.Price = {DefaultPrice: i.Price.DefaultPrice, CarTypePrice: i.Price.DefaultPrice};
                }

            });
            res.jsonp(objs);
        }
    });
};
function getPrices(objIds, cb) {
    PriceC.find({"RelativeObj.Item1": {$in: objIds}}).toArray(cb);
}
function getCarTypeClassesByRangeAndCarType(df, ct, cb) {
    if (typeof df == 'string') {
        CarTypeClasses.find({Range: {$regex: df}}).toArray(function (e, ds) {
            var r = _.filter(ds, function (i) {
                return _.any(i.CarTypes, function (ci) {
                    return ci.Vlaue.indexOf() > -1 || ct.indexOf(ci.Value) > -1;
                })
            });
            cb(null, r);
            return;
        });
    }
    else {
        CarTypeClasses.find({Range: {$in: df}}).toArray(function (e, ds) {
            var r = _.filter(ds, function (i) {
                return _.any(i.CarTypes, function (ci) {
                    return ci.Vlaue.indexOf() > -1 || ct.indexOf(ci.Value) > -1;
                })
            });
            cb(null, r);
            return;
        });
    }
}
exports.getprosetting = function () {
    var id = req.query['id'];
    var pri = req.query['pri'];
    if (pri) {
        async.waterfall([
            function (cb) {
                ProjectSetting.findOne({_id: id}, cb);
            },
            function (st, cb) {
                PriceC.findOne({'RelativeObj.Item1': _st._id}, function (e, d) {
                    st.Price = {DefaultPrice: d ? d.DefaultPrice : 0};
                    cb(null, st);
                })
            }
        ], function (e, rs) {
            res.jsonp(rs);
        })
    }
    else {
        ProjectSetting.findOne({_id: id}, function (e, d) {
            res.jsonp(d);
        });
    }
};
function getCommodity(t, query, option, cb) {
    switch (t) {
        case 'AutoPart':
            AutoPart.find(query, option).toArray(cb);
            break;
        case 'AutoArticles':
            AutoArticle.find(query, option).toArray(cb);
            break;
        case 'Project':
            Project.find(query, option).toArray(cb);
            break;
    }
}
function getObjPrice(type, objID, ct, callback) {
    async.waterfall([
        function (cb) {
            getCommodity(type, {_id: objID}, {}, cb);
        },
        function (obj, cb) {
            var bo = _.find(global.BOs, function (i) {
                return i._id == obj.Define.Value;
            });
            cb(obj, bo.ValuePath);
        },
        function (obj, range, cb) {
            range = range.replace(/\//g, '_');
            CarTypeClasses.find({$where: "'" + range + "'.indexOf(this.Range)>-1"}, {CarTypes: 1}).toArray(function (e, ds) {
                var _p = _.find(ds, function (i) {
                    return i.Value == ct;
                });
                cb(null, obj, _p);
            });
        },
        function (obj, carTypeClass, cb) {
            PriceC.findOne({'RelativeObj.Item1': obj.ID, 'RelativeObj.Item3': {$regex: type}}, function (e, d) {
                if (!d || d.length == 0) {
                    cb(null, {DefaultPrice: 0, CarTypePrice: 0});
                }
                else if (d.CarTypes && d.CarTypes.length > 0 && _.any(d.CarTypes, function (ct) {
                    return ct.Value == ct;
                })) {
                    var l = _.find(d.CarTypes, function (ctprice) {
                        return ctprice.Value == ct;
                    });
                    cb(null, {DefaultPrice: d.DefaultPrice, CarTypePrice: l.Price});
                }
                else if (carTypeClass && d.CarTypeClasses && d.CarTypeClasses.length > 0 && _.any(d.CarTypeClasses, function (ctcli) {
                    return ctcli.Item1 == carTypeClass._id;
                })) {
                    var cit = _.find(d.CarTypeClasses, function (cti) {
                        return cti.Item1 == carTypeClass._id;
                    });
                    var _ctip = eval(d.DefaultPrice + cit.Item3 + cit.Item4);
                    cb(null, {DefaultPrice: d.DefaultPrice, CarTypePrice: _ctip});
                }
                else {
                    cb(null, {DefaultPrice: d.DefaultPrice, CarTypePrice: d.DefaultPrice});
                }
            });
        }
    ], callback);
}

exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    var query = req.query['q'] || {};
    switch (t) {
        case 'combineds':
            var o = req.query['o'] || {};
            checkQueryOption(o, 'Combined');
            Combined.find(query, o).toArray(function (e, ds) {
                res.jsonp(ds)
            });
            break;
        case 'delcombined':
            var id = req.query['id'];
            Combined.remove({_id: id}, function (e) {
                res.jsonp({msg: e == null, error: e});
            });
            break;
        case 'combined':
            Combined.findOne(query, function (e, d) {
                res.jsonp(d);
            });
            break;
        case 'm':
            async.waterfall([
                function (wcb) {
                    Combined.find().toArray(wcb);
                },
                function (cs, wcb) {
                    async.parallel({
                        pros: function (pcb) {
                                var _pids = _.chain(cs)
                                    .map(function(i){return i.Items})
                                    .map(function(i){return i[0]})
                                    .filter(function(i){return i;})
                                    .filter(function (i){ return i.RelativeObj.Item3=='Project'})
                                    .map(function(i){return i.RelativeObj.Item1})
                                    .uniq()
                                    .value()
                            Project.find({_id: {$in: _pids}}).toArray(pcb);
                        },
                        parts: function (pcb) {
                            var _partIDs =_.chain(cs)
                                .map(function(i){return i.Items})
                                .map(function(i){return i[0]})
                                .filter(function(i){return i;})
                                .filter(function (i){ return i.RelativeObj.Item3=='AutoPart'})
                                .map(function(i){return i.RelativeObj.Item1})
                                .uniq()
                                .value()
                            AutoPart.find({_id: {$in: _partIDs}}).toArray(pcb);
                        },
                        ats: function (pcb) {
                            var _artIds = _.chain(cs)
                                .map(function(i){return i.Items})
                                .map(function(i){return i[0]})
                                .filter(function(i){return i;})
                                .filter(function (i){ return i.RelativeObj.Item3=='AutoArticles'})
                                .map(function(i){return i.RelativeObj.Item1})
                                .uniq()
                                .value()
                            AutoArticle.find({_id: {$in: _artIds}}).toArray(pcb);
                        }
                    }, function (e, result) {
                        async.each(
                            cs,
                            function (i, ecb) {
                                _.each(i.Items,function (it){
                                    var l = {};
                                    it.Model='';
                                    it.Unit='';
                                    if(it.Item3=='Project'){ it.Model='';it.Unit='';  }
                                    else{
                                        l= _.find(result.parts,function (pi){ return pi._id==it.Item1; });
                                        if(l){
                                            it.Model= l.Model;
                                            it.Unit= l.Unit;
                                        }
                                        else{
                                             l= _.find(result.ats,function (pi){ return pi._id== it.Item1 });
                                             if(l){
                                                 it.Model= l.Model;
                                                 it.Unit= l.Unit;
                                             }
                                        }

                                    }
                                });
                                Combined.update({_id: i._id},{$set:{Items: i.Items}},ecb);
                            },
                            function () {
                                wcb(null)
                            });
                    });
                }
            ], function (e) {
                res.json('done');
            })
            break;
    }
};
exports.post = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'savecombined':
            var obj = JSON.parse(req.body['obj']);
            async.waterfall([
                function (cb) {
                    if (obj._id) {
                        var oid = obj._id;
                        delete obj._id;
                        Combined.update({_id: oid}, {$set: obj}, function (e) {
                            cb(e, obj);
                        });
                    }
                    else {
                        cb(null, null);
                    }
                },
                function (d, cb) {
                    if (d) {
                        cb(null, d);
                    }
                    else {
                        obj._id = Combined.ObjectID().toString();
                        Combined.insert(obj, function (e, ds) {
                            cb(e, ds[0]);
                        });
                    }
                }
            ], function (e, d) {
                res.json({msg: e == null, error: e, ID: d._id});
            })
            break;
    }
}

