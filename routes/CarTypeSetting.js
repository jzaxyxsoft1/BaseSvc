var db = require('DB').DB;
var async=require('async');
var _=require('underscore');
exports.getbyct=function (req,res){
    var ct=req.query['ct'];
    db.CarTypeSetting.findOne({$where:"'"+ct+"'.indexOf(this.ID)>-1"},function (e,ds){
        if(ds){delete ds._id;}
        res.jsonp(ds);
    });
};