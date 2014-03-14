var mongo = require('mongoskin');
var db = require('DB').DB;
//var db = mongo.db('localhost:4000/ECTABase?auto_reconnect');
//db.bind('AutoArticles');
var cllection = db.AutoArticles;
var brandC = db.Brand;
var _ = require('underscore');
var async = require('async');
var priceC = db.Price;
var tpCollection = db.TierPattern;
exports.getobj = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'];
    cllection.findOne(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
}
exports.getobjbyid = function (req, res) {
    var query = req.query['query'];
    cllection.findById(query, function (err, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(doc);
    })
}
exports.getobjs = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    async.waterfall([
        function (cb) {
            cllection.find(query, option).toArray(cb);
        },
        function (e, rs, cb) {
            brandC.find().toArray(function (e2, brs) {
                cb(e2, rs, brs);
            });
        },
        function ( objs, brands, cb) {
            _.each(objs, function (i) {
                i.ExtProperties.BrandImg = _.find(brands,function (br) {
                    return br._id == i.ExtProperties.BrandID
                }).LogoUrl || '';
            });
        }
    ], function (e, rtn) {
        res.jsonp(rtn);
    });
}
exports.getobjswithbrands = function (req, res) {
    var query = req.query['query'];
    var option=req.query['option'];
    option=option?JSON.parse(option):{};
    async.waterfall([
        function (cb) {
            cllection.find(query,option).toArray(cb);
        },
        function (objs, cb) {
            var ids = _.chain(objs)
                .map(function (i) {
                    return i.ExtProperties.BrandID;
                })
                .uniq(function (i) {
                    return i;
                })
                .value();
            async.parallel([
                function (ccb) {
                    brandC.find({_id: {$in: ids}}).toArray(ccb);
                },
                function (ccb) {
                    var oids = _.map(objs, function (i) {
                        return i._id;
                    });
                    priceC.find({'RelativeObj.Item1': {$in: oids}}).toArray(ccb);
                } ,
                function (ccb) {
                    tpCollection.find({BrandID: {$in: ids}}).toArray(ccb);
                }
            ], function (er1, rts) {
                cb(er1, objs, rts);
            });

        }
    ], function ( e, objs, rtts) {
        var bid, img;
        _.each(objs, function (i) {
            i.BrandName = i.ExtProperties.BrandName;
            i.BrandID = i.ExtProperties.BrandID;
            img = i.Properties['7cfd275b-6d06-46b0-03d5-15ca5a74027e'];
            if (i.BrandID && img) {
                bid = _.find(rtts[2], function (ii) {
                    return ii.BrandID == i.BrandID && ii.PatternValue == img.Value;
                });
                if (bid) {
                    i.Img = bid.Imgs.shift();
                    i.ImgUrls = bid.Imgs;
                }
            }
            i.Price = {DefaultPrice: 0, CarTypePrice: 0};
            bid = _.find(rtts[1], function (ii) {
                return ii.RelativeObj.Item1 == i._id;
            });
            if (bid) {
                i.Price = {DefaultPrice: bid.DefaultPrice, CarTypePrice: bid.DefaultPrice};
            }
            i.BrandLogo = '';
            bid = _.find(rtts[0], function (ii) {
                return ii._id == i.BrandID;
            });
            if (bid) {
                i.BrandLogo = bid.LogoUrl || '';
            }
        });
        res.jsonp({objs: objs});
    });
};
exports.save = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'];
    cllection.save(query, function (err, docs) {
        if (err)res.jsonp(err);
        //else if (docs.length > 1)res.jsonp(docs.length);
        else res.jsonp(docs._id.toString());
    })
}
exports.updateById = function (req, res) {
    var query = req.query['id'];
    var option = req.query['option'];
    delete option._id;
    cllection.updateById(query, option, function (err, count, doc) {
        if (err)res.jsonp(err);
        else res.jsonp(true);
    })
}
