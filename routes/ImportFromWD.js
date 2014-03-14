var db = require('DB').DB;
var request = require('request');
var _ = require('underscore');
var async=require('async');
var pinyin = require('pjpinyin');
exports.imporhrs = function (req, res) {
    request('http://www.jzaxyx.com:8888/CRM/GetData?t=gethrs', function (e, respone, body) {
        var ss = JSON.parse(body);
        var deps = ss.Table;
        _.each(deps, function (i) {
            i._id =  i.ID;
            i.flag= parseInt(i.ID);
            delete i.ID;
            i.Parent = {  Name: '部门', Value: '0'  };
            i.ValuePath= '0/'+ i._id;
            i.OrgID='01';
        });
        _.each(ss.Table1, function (i) {
            var _p = _.find(deps, function (ii) {
                return ii._id == i.ParentID;
            });
            if (_p) {
                i.Parent = {Name: _p.Name, Value: _p._id};
                i._id=_p._id+'_'+ i.ID;
                i.flag= parseInt(i.ID);
                i.OrgID="01";
                i.ValuePath= _p.ValuePath+'/'+ i._id;
                delete i.ID;
                delete i.ParentID;
                deps.push(i);
            }
        });
        var emps = ss.Table2;
        _.each(emps, function (i) {
            var _p = _.find(deps, function (dep) {
                return dep._id == i.GSID;
            });
            i.Department = _p ? {Name: _p.Name, Value: _p._id} : {Name: '部门', Value: '0'};
            i._id = _p ? _p._id + '_' + i.ID : '0_' + i.ID;
            i.flag=parseInt(i.ID);
            i.Simcode=pinyin(i.Name,'');
            delete i.ID;
            delete i.GSID;
        });
        async.parallel([
            function (cb){
            db.Department.insert(deps,cb);
        },
        function (cb){
            db.Employee.insert(emps,cb);
        }],function (e){
            res.json({Dep:deps.length,Emps:emps.length});
        })
    });
}
