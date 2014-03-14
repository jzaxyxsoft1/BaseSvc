var mongo = require('mongoskin');
var db1 = mongo.db('localhost:4000/test?auto_reconnect');
var carInfo = db1.collection('CarInfo');
exports.get = function (req, req) {
    var t = req.query['t'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    switch (t) {
        case 'obj':
            carInfo.findOne(query, option, function (e, r) {
                if (r == null && query._id) {
                    carInfo.insert({_id: query._id});
                }
                res.jsonp(r);
            });
            break;
        case 'objs':
            carInfo.find(query, option).toArray(function (e, rs) {
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
            o._id = carInfo.ObjectID().toString();
            carInfo.insert(o, function (e, rs) {
                res.jsonp({msg: true, ID: rs[0]._id});
            });
            break;
        case 'u':
            var q = req.body.query;
            carInfo.update(q, {$set: o}, function (e) {
                res.jsonp({msg: true, ID: q._id || o._id});
            });
            break;
    }
}

