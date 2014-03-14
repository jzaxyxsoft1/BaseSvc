var async = require('async');
var _ = require('underscore');
var Svc = require('Svc').Svc;
var PriceSvc = require('Svc').PriceSvc;
var db = require('DB').DB;
exports.get = function (req, res) {
    var t = req.query['t'];
    switch (t) {
        case 'einit': //编辑初始化
            var did = req.query['did'];
            async.parallel(
                {
                    CarTypeClasses: function (pcb) {
                        db.CarTypeClass.find({RangePath: {$regex: did}}, {Name: 1}).toArray(function (e, ds) {
                            ds = ds || [];
                            pcb(e, ds);
                        });
                    },
                    SubProjects: function (pcb) {
                        db.SheetMetalSubProject.find({}).toArray(function (e, ds) {
                            ds = ds || [];
                            pcb(e, ds);
                        })
                    }
                },
                function (e, result) {
                    res.jsonp(result);
                }
            );
        case 'objwithprice':
            var id = req.query['id'];
            var cardType = req.query['cdt'];
            var carType = req.query['ct'];
            PriceSvc.getSheetMetalPrice(id, carType,cardType,function (e,o){
                res.jsonp(o);
            })
            break;
        default :
            break;
    }
}
exports.post = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var t = req.body['t'];
    switch (t) {
        case 'save':
            var obj = JSON.parse(req.body['obj']);
            var newSubPros = JSON.parse(req.body['newSubPros']);
            async.parallel(
                [
                    function (cb) {
                        db.SheetMetalProjectPrice.remove({_id: obj._id}, function (e) {
                            db.SheetMetalProjectPrice.insert(obj, cb);
                        });
                    },
                    function (cb) {
                        if (newSubPros.length) {
                            newSubPros = newSubPros.map(function (i) {
                                return {_id: db.SheetMetalSubProject.ObjectID().toString(), Name: i}
                            });
                            db.SheetMetalSubProject.insert(newSubPros, cb);
                        }
                        else(cb(null))
                    }
                ],
                function (e) {
                    res.json({msg: e == null, error: e});
                })

            break;
    }
}
