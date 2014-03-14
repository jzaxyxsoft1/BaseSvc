var _ = require('underscore');
var async = require('async');
var db = require('DB').DB;
var tool = require('Tools').Tools;
var svc = require('SVC');
exports.get = function (req, res) {
    var t = req.query['t'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    switch (t) {
        case 'objs':
            db.Price.find(query, option).toArray(function (e, ds) {
                res.jsonp(ds);
            });
            break;

    }
};
exports.getobjpricesbyct = function (req, res) {
    var query = req.query['query'];  //[{tp:'',ids:['string']}]
    var ct = req.query['ct'];
    var option = req.query['option'] || {};
    var r = [];
    async.each(query,
        function (qi, cb) {
            svc.PriceSvc.getObjPriceByCarType(qi.tp, {_id: {$in: qi.ids}}, option, ct, function (e, rs) {
                r = _.union(r, rs);
                cb(null);
            });
        },
        function (e) {
            res.jsonp(r);
        });
}
exports.postsave=function (req,res){
     res.set({'Access-Control-Allow-Origin': '*'});
    var obj=JSON.parse(req.body['obj']);
    if(obj._id){
        db.Price.update({_id:obj._id},obj,function (e){
            res.jsonp({msg:e?false:true,ID:obj._id,error:e});
        });
    }
    else{
        obj._id= db.Price.ObjectID().toString();
        db.Price.insert(obj,function (e,ds){
            res.jsonp({msg:e?false:true,ID:ds?ds[0]._id:null,error:e});
        });
    }
}


