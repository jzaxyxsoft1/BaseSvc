
var db =    require('DB').DB;
var BO =db.BODefine;
var CarTypeClass = db.CarTypeClass;
var Price = db.Price;
var _ = require('underscore');
var async = require('async');
var Materails = {
    AutoPart: db.AutoPart,
    AutoArticle: db.AutoArticle,
    Project:db.Project
};
var tool = require('Tools').Tools;
exports.get = function (req, res) {
    var t = req.query['t'];
    switch (t) {
        case 'getcartypeclasseswithobj':
            var id = req.query['id'];
            var tp = req.query['tp'];
            var ct = req.query['ct'];
            getCarTypeClassesWithObjID(id, tp, ct, function (e, rs) {
                res.jsonp(rs);
            })
            break;
        case 'getcartypeclasseswithobjs':
            var objs = req.query['objs'];
            var ct = req.query['ct'];
            var tp = req.query['tp'];
            var rts = [];
            _.each(objs, function (i) {
                getCarTypeClassesWithObjID(i, tp, ct, function (e, rtn) {
                    rts.push(rtn);
                    if (rts.length == objs.length) {
                        res.jsonp(rts);
                    }
                });
            });
//            _.each(objs, function (i) {
//                getCarTypeClassesWithObjID(i,  tp, ct, function (e, rs) {
//                    rts.push(rs);
//                    if (rts.length == objs.length) {
//                        res.jsonp(rts);
//                    }
//                })
//            });
            break;
        case 'getcartypeclsofcartype':
            var df = req.query['df'];
            var ct = req.query['ct'];
            CarTypeClass.findOne({Range: df, CarTypes: {$elemMatch: {Value: ct}}}, function (e, rds) {
                res.jsonp(rds);
            });

            break;
        case 'getobjs':
            var query = req.query['query'];
            var option = req.query['option'] || {};
            CarTypeClass.find(query, option).toArray(function (e, r) {
                res.jsonp(r);
            });
            break;
        case 'getcartypeclasswithct':
            var ct = req.query['ct'];
            var query = req.query['query'];
            var pp = tool.CreateValuePathArray(ct, '/').reverse();
            CarTypeClass.find(query).toArray(function (e, ds) {
                var r = _.find(ds, function (i) {
                    return _.any(i.CarTypes, function (ii) {
                        return _.any(pp, function (iii) {
                            return iii == ii.Value;
                        })
                    });
                });
                if (r) {
                    res.jsonp({_id: r._id, Name: r.Name, Range: r.Range});
                }
                else {
                    res.jsonp(null);
                }
            });
            break;
    }
}
exports.postsave=function (req,res){
    var obj=req.query['obj'];
    var _ids = _.map(obj,function (i){ return i.ID;});
    CarTypeClass.find({_id:{$in:_ids}}).toArray(function (e,ds){
        var dfs = _.filter(ds,function (i){ return _.any(obj,function (ii){ return ii.ID== i._id&& ii.Name!= i.Name; }); });
        var ctls ;
        if(dfs.length>0){ ctls = _.map(dfs,function (i){ return {_id: i.ID,Name: i.Name}});}
        async.each(obj,function (i,cb){
            CarTypeClass.update({_id: i.ID},i,cb);
        },function (e){
            if(dfs.length>0){
                updateCarTypeClassRefrences(ctls,function (){res.jsonp({msg:true});})
            }
            else{res.jsonp({msg:true});}
        });
    });
}
function getCarTypeClassesWithObjID(objID, objType, carType, cb) {
    async.waterfall([
        function (cb) {
            objType = objType.split('.');
            objType = objType[objType.length - 1];
            Materails[objType].findOne({_id: objID}, cb);
        },
        function (obj, cb) {
            if (obj == null) {
                cb(null, null);
            }
            else {
                BO.findOne({_id: obj.Define.Value}, function (e, bo) {
                    cb(e, bo.ValuePath);
                });
            }
        },
        function (vp, cb) {
            if (vp == null) {
                cb(null, null);
            }
            else {
                vp = vp.replace(/\//g, '_') + objID;
                CarTypeClass.find(
                    {$where: "'" + vp + '_' + objID + "'.indexOf(this.Range)>-1"
                    }).toArray(function (e, rrs) {
                        if (rrs == null) {
                            cb(null, {objID: objID});
                            return;
                        }
                        var prrs = _.filter(rrs, function (i) {
                            return _.any(i.CarTypes, function (ci) {
                                return ci.Value.indexOf(carType) > -1 || carType.indexOf(ci.Value) > -1;
                            })
                        })
                        cb(null, _.map(prrs, function (i) {
                            return {_id: i._id, Name: i.Name, Range: i.Range, objID: objID};
                        }));
                    });
            }
        }
    ], cb);
}
function updateCarTypeClassRefrences(idnameAry,callback){
        var ids = _.map(idnameAry,function (i){ return i._id});
    async.parallel({
        price:function (cb){
           Price.find({CarTypeClasses:{$elemMatch:{Item1:{$in:ids}}}},{CarTypeClasses:1}).toArray(function (e,ds){
               async.each(ds,function (pri,pricb){
                   var ctcls = _.filter(pri.CarTypeClasses,function (cli){ return _.any(ids,function (idi){ return idi._id== cli.Item1; });  })
                   _.each(ctcls,function (i){
                        var ii = _.find(ids,function (ii){ return ii._id== ii.Item1; });
                       i.Item2= ii.Name;
                   });
                   Price.update({_id:pri._id},{$set:{CarTypeClasses:pri.CarTypeClasses}},pricb);
               },cb);
           });
        }
    },callback);
}