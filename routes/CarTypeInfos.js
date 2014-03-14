var mongo = require('mongoskin');
var db1 = mongo.db('localhost:4000/test?auto_reconnect');
var carTypeInfor = db1.collection('CarTypeInfo');
exports.get = function (req, req) {
    var t = req.query['t'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    switch (t) {
        case 'obj':
            carTypeInfor.findOne(query, option, function (e, r) {
                if (r == null && query._id) {
                    carTypeInfor.insert({_id: query._id});
                }
                res.jsonp(r);
            });
            break;
        case 'objs':
            carTypeInfor.find(query, option).toArray(function (e, rs) {
                res.jsonp(rs);
            });
            break;
    }
};
exports.post = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var o = JOSN.parse(req.body.o);
    var t = req.body.t;
    switch (t) {
        case 'i':
            o._id = carTypeInfor.ObjectID().toString();
            carTypeInfor.insert(o, function (e, rs) {
                res.jsonp({msg: true, ID: rs[0]._id});
            });
            break;
        case 'u':
            var q = req.body.query;
            carTypeInfor.update(q, {$set: o}, function (e) {
                res.jsonp({msg: true, ID: q._id || o._id});
            });
            break;
    }
}
