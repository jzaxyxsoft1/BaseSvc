var db = require('DB').DB;
var async = require('async');
var _ = require('underscore');
exports.getobj = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'];
    db.Bill.findOne(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
}
exports.getobjbyid = function (req, res) {
    var query = req.query['query'];
    db.Bill.findById(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
}
exports.getobjs = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'];
    db.Bill.find(query).toArray(function (err, docs) {
        if (err)res.jsonp(err);
        else res.jsonp(docs);
    })
}
exports.del = function (req, res) {
    var query = req.query['query'];
    db.Bill.remove(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(true);
    })
};

exports.postsave = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var query = JSON.parse(req.body.query);
    query._id = query._id ? query._id == '' || query._id == '0' ? db.Bill.ObjectID().toString(): query._id : db.Bill.ObjectID().toString() ;
    db.Bill.insert(query, function (err, docs) {
        if (err)res.jsonp(err);
        //else if (docs.length > 1)res.jsonp(docs.length);
        else {
//            docs=docs[0];
//            if (docs.Card.Number == '' && docs.Car.Name != '') {
//                db.Potential.findOne({"Car.Name": docs.Car.Name}, {}, function (err, doc) {
//                    var tempDoc = {};
//                    if (doc == null) {
//                        tempDoc.Car = docs.Car;
//                        tempDoc.Owner = docs.Owner;
//                        tempDoc.Bills = [];
//                        tempDoc.Bills.push(docs._id);
//                    } else {
//                        tempDoc = doc;
//                        tempDoc.Bills.push(docs._id);
//                    }
//                    db.Potential.save(tempDoc);
//                });
            //}
            res.send(docs[0]._id);
        }
    })
}
exports.save = function (req, res) {
    var query = req.query['query'];
    var option = JSON.parse(req.query['option']);
    db.Bill.save(query, function (err, docs) {
        if (err)res.jsonp(err);
        //else if (docs.length > 1)res.jsonp(docs.length);
        else res.jsonp(docs._id.toString());
    })
}
exports.updateById = function (req, res) {
    var query = req.query['id'];
    var option = JSON.parse(req.query['option']);
    delete option._id;
    db.Bill.updateById(query, option, function (err, count, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(true);
    })
}
exports.postupdate = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var query = req.body.query;
    var option = JSON.parse(req.body.option);
    delete option._id;
    db.Bill.update(query, option, function (err, count, doc) {
        res.jsonp(true);
    })

}
exports.getobjprices = function (req, res) {
    var id = req.query['id'];

}
exports.getobjdiscounts = function (req, res) {
    var id = req.query['id'];

}

