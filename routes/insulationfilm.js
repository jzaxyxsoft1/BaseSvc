/**
 * 隔热膜
 * User: wdg
 * Date: 13-12-11
 * Time: 上午12:18
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongoskin');
var db = mongo.db('localhost:4000/test?auto_reconnect');
var carTypeCollection = db.collection('InsulationCarType');
var carTypeSettingC = db.collection('TMCarTypeSetting');
//var priceCollection = db.collection('InsulationFilmPrice');
var async = require('async');
var priceCollection = db.collection('Prices');
var _ = require('underscore');
var bsdb = mongo.db('localhost:4000/ECTABase?auto_reconnect');
var artCollection = bsdb.collection('AutoArticles');
/*威固车型导入*/
exports.impot = function (req, res) {
    carTypeCollection.remove({}, function (e) {
        mongo.db('localhost:4000/test2?auto_reconnect').collection('cars').find({}).toArray(function (ee, ds) {
            _.each(ds, function (m1) {
                _.each(m1.items, function (m2) {
                    delete m2.前挡;
                    delete m2.车身;
                });
            });
            carTypeCollection.insert(ds, {}, function (eee, ds) {
                res.json(ds.length);
            });
        });
    });
};
var DD = {};
exports.importprice = function (req, res) {
    var bid = '52a6c1c5e03560097cf68794';
    var priC = mongo.db('localhost:4000/test2?auto_reconnect').collection('prices');

    artCollection.find({'ExtProperties.BrandID': bid}).toArray(function (e1, arts) {
        _.each(arts, function (art) {
            var pn = '隔热膜_' + art.Name , nn = art.Name.indexOf() < 0 ? 'V-KOOL ' + art.Name.trim() : art.Name;
            var ppid = {$or: [
                {'CS.Product.Name': pn},
                {'QD.Product.Name': pn}
            ]};
            priC.find(ppid).toArray(function (e2, pris) {
                _.each(pris, function (pri) {
                    var b = false;
                    if (pri.CS.Product.Name == pn) {
                        pri.CS.Product = {Name: nn, Value: art._id, BrandID: bid};
                        b = true;
                    }
                    if (pri.QD != null && pri.QD.Product.Name == pn) {
                        pri.QD.Product = {Name: nn, Value: art._id, BrandID: bid};
                        b = true;
                    }
                    if (b) {
                        priC.update({_id: pri._id}, pri, {multi: false}, function () {
                        });
                    }

                    if (pri.QD == null) {
                        if (DD[art._id] == undefined) {
                            DD[art._id] = 1;
                        }
                    }
                });
            });
            if (art.Name.indexOf('V-KOOL') < 0) {
                artCollection.update({_id: art._id}, {$set: {Name: nn}}, {multi: false}, function () {
                });
            }
        });

    });
    res.send('Done');

};
exports.updatapro = function (req, res) {
    artCollection.find({'ExtProperties.BrandName': '威固'}).toArray(function (e, ds) {
        _.each(ds, function (pro) {
            pro.Properties['814f5897-446f-4cb7-8fdc-e5e1ef8c4201'] = {Name: '隔热指数', Value: pro.ExtProperties.隔热指数};
            pro.Properties['f2f55a6b-0b4c-498b-aac0-8b7b70b0c8fd'] = {Name: '透光指数', Value: pro.ExtProperties.透光指数};
            pro.Properties['a69ff977-3142-49cf-1d44-24b5dc5f4d1b'] = {Name: '紫外线阻隔指数', Value: pro.ExtProperties.紫外线阻隔指数};
            artCollection.update({_id: pro._id}, {$set: {Properties: pro.Properties}}, {multi: false}, function () {
            });
        });
    });
};

/*获取车型品牌位置产品价格集合*/
exports.getbrandpositionctarts = function (req, res) {
    var bid = req.query['bid'];
    var pst = req.query['pst'];
    var ct = req.query['ct'];
    artCollection.find({'ExtProperties.BrandID': bid}, {Name: 1, Model: 1, Properties: 1, ExtProperties: 1, Summary: 1, Define: 1,ExtObjNum:1}).toArray(function (e, docs) {
            var wz = pst == 'CS' ? '车身' : '通用';
            var ts = docs;
            var tids = _.map(docs, function (i) {
                return i._id;
            });
            if (wz == '通用') {
                ts = _.filter(docs, function (i) {
                    return global.BOTool.getPropertyValue(i, '位置') == wz;
                });
                tids = _.map(ts, function (i) {
                    return i._id;
                });
            }
            if (bid != '52a6c1c5e03560097cf68794') {
                docs = _.filter(docs, function (i) {
                    return _.any(tids, function (ii) {
                        return ii == i._id;
                    })
                })
                async.parallel({
                    pris: function (ccb) {
                        priceCollection.find({'Product.Value': {$in: tids}}).toArray(ccb);
                    },
                    cts: function (ccb) {
                        carTypeSettingC.findOne({CarTypeID: ct}, ccb);
                    }
                }, function (ee, rrs) {
                    var ddr = [];
                    _.each(docs, function (art) {
                        art.TypeFullName = 'ACS.Commodities.AutoArticles';
                        var bo = _.find(global.BOs, function (ii) {
                            return ii._id == art.Define.Value;
                        });
                        art.ValuePath = bo ? bo.ValuePath : '';
                        global.BOTool.convertPropertiesToArray(art);
                        var p = _.find(rrs.pris, function (pii) {
                            return pii.Product.Value == art._id;
                        }), qisp, cisp;
                        if (p == undefined) {
                            qisp = 0;
                            cisp = 0;
                        } else {
                            qisp = p.QD.价格;
                            cisp = p.CS.价格;
                        }
                        var lpp ={
                            "CarTypeID" : rrs.cts.CarTypeID,
                            "CS" : {
                                "价格" : cisp,
                                "施工时间" :rrs.cts.CS.施工时间,
                                "施工难度" : rrs.cts.CS.施工难度,
                                "面积" :rrs.cts.CS.面积
                            },
                            "QD" : {
                                "价格" :qisp,
                                "施工时间" :rrs.cts.QD.施工时间,
                                "施工难度" :rrs.cts.QD.施工难度,
                                "面积" :rrs.cts.QD.面积
                            }
                        };
                        ddr.push({Article: art, Price: lpp});
                    });
                    res.jsonp(ddr);
                });
            }
            else {
                priceCollection.find({'Product.Value': {$in: tids}, CarTypeID: ct}).toArray(function (e1, r) {
                    var rtn = [];
                    _.each(r, function (p) {
                        var art = _.find(ts, function (ai) {
                            return ai._id.toString() == p.Product.Value;
                        });
                        art.TypeFullName = 'ACS.Commodities.AutoArticles';
                        var bo = _.find(global.BOs, function (ii) {
                            return ii._id == art.Define.Value;
                        });
                        art.ValuePath = bo ? bo.ValuePath : '';
                        global.BOTool.convertPropertiesToArray(art);
                        rtn.push({Article: art, Price: p});
                    });
                    res.jsonp(rtn);
                });
            }
        }
    )
    ;
}
;
/*获取产品*/
exports.getbrandproducts = function (req, res) {
    var bid = req.query['bid'];//品牌id
    artCollection.find({ 'ExtProperties.BrandID': bid}).toArray(function (e, ds) {
        res.jsonp(ds);
    });
};
/*获取车型 id==0?返回第一级:取items*/
exports.getcartypes = function (req, res) {
    var id = req.query['id'];
    if (id == '0') {
        carTypeCollection.find({}, {name: 1}).toArray(function (e, ds) {
            res.jsonp(ds);
        });
    }
    else {
        carTypeCollection.findById(id, {items: 1}, function (e, ds) {
            res.jsonp(ds.items);
        });
    }
};

/*获取价格 */
exports.getprice = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    priceCollection.findOne(query, option, function (e, ds) {
        res.jsonp(ds);
    })
};
exports.getpricebypidct = function (req, res) {
    var pid = req.query['pid'];
    var ct = req.query['ct'];
    priceCollection.findOne({CarTypeID: ct, 'Product.Value': pid}, {}, function (e, r) {
        res.jsonp(r);
    });
};
/*保存价格*/
exports.postsaveprice = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var id = req.body.id;
    var option = JSON.parse(req.body.option);
    if (id == undefined || id == '' || id == '0') {
        option._id = db.ObjectID.toString();
    }
    else {
        option._id = id;
    }
    priceCollection.save(option, function (e, d) {
        res.jsonp(option._id);
    });
};


//exports.imprtCarTypeStting = function (req, res) {
// 车型 施工难度,面积,工作时间导入
//    priceCollection.find({QD: {$ne: null}}, {CarTypeID: 1, CS: 1, QD: 1}).toArray(function (e, ds) {
//        var ts = [];
//        var tts = _.chain(ds)
//            .uniq(function (i) {
//                return i.CarTypeID;
//            })
//            .map(function (i) {
//                return {CarTypeID: i.CarTypeID, CS: {}, QD: i.QD}
//            }).value();
//        async.each(tts, function (i, cb) {
//            priceCollection.findOne({CarTypeID: i.CarTypeID,CS:{$ne:null}},function (e,rs){
//                if(rs){i.CS= rs.CS;}
//                ts.push(i);
//                cb();
//            });
//
//        }, function (e) {
//            carTypeSettingC.insert(ts,function (e,ds){
//
//            });
//        });
//    });
//}

exports.imptPro = function (req, res) {
    var pris = {
        'AutoArticle__LZM': [
            {
                "_id": "52be78bb5260e07c5f000002",
                "Name": "量子膜 HP Titanium16 钛金17",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78bb5260e07c5f000006",
                "Name": "量子膜 Quantum37",
                QD: {价格: 0},
                CS: {价格: 2080}
            },
            {
                "_id": "52be78bb5260e07c5f000007",
                "Name": "量子膜 Quantum52",
                QD: {价格: 0},
                CS: {价格: 2180}
            },
            {
                "_id": "52be78bb5260e07c5f000001",
                "Name": "量子膜 HP Titanium6 钛金6",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78bb5260e07c5f000003",
                "Name": "量子膜 Quantum14",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78bb5260e07c5f000004",
                "Name": "量子膜 Quantum19",
                QD: {价格: 0},
                CS: {价格: 2080}
            },
            {
                "_id": "52be78bb5260e07c5f000005",
                "Name": "量子膜 Quantum28",
                QD: {价格: 0},
                CS: {价格: 2080}
            },
            {
                "_id": "52be78bb5260e07c5f000008",
                "Name": "量子膜 Sterling70铂金70",
                QD: {价格: 1980},
                CS: {价格: 0}
            },
            {
                "_id": "52be78bb5260e07c5f00000a",
                "Name": "量子膜 MP75 水晶75",
                QD: {价格: 2400},
                CS: {价格: 0}
            },
            {
                "_id": "52be78bb5260e07c5f00000b",
                "Name": "量子膜 LX40 钻石40",
                QD: {价格: 0},
                CS: {价格: 7900}
            },
            {
                "_id": "52be78bb5260e07c5f00000c",
                "Name": "量子膜 LX70 钻石70",
                QD: {价格: 4999},
                CS: {价格: 0}
            }
        ],
        'AutoArticle__Carlife': [
            {
                "_id": "52be78bd5260e07c5f000016",
                "Name": "Carlife F30",
                QD: {价格: 0},
                CS: {价格: 1580}
            },
            {
                "_id": "52be78bd5260e07c5f00000f",
                "Name": "Carlife X80",
                QD: {价格: 2680},
                CS: {价格: 4680}
            },
            {
                "_id": "52be78bd5260e07c5f000010",
                "Name": "Carlife X75",
                QD: {价格: 2280},
                CS: {价格: 4180}
            },
            {
                "_id": "52be78bd5260e07c5f000011",
                "Name": "Carlife X65",
                QD: {价格: 0},
                CS: {价格: 3680}
            },
            {
                "_id": "52be78bd5260e07c5f000012",
                "Name": "Carlife X50",
                QD: {价格: 0},
                CS: {价格: 2880}
            },
            {
                "_id": "52be78bd5260e07c5f000013",
                "Name": "Carlife X35",
                QD: {价格: 0},
                CS: {价格: 3480}
            },
            {
                "_id": "52be78bd5260e07c5f000014",
                "Name": "Carlife X20",
                QD: {价格: 0},
                CS: {价格: 2880}
            },
            {
                "_id": "52be78bd5260e07c5f000015",
                "Name": "Carlife X10",
                QD: {价格: 0},
                CS: {价格: 3480}
            },
            {
                "_id": "52be78bd5260e07c5f000017",
                "Name": "Carlife F15",
                QD: {价格: 0},
                CS: {价格: 1780}
            }

        ],
        'AutoArticle__SRJ': [
            {
                "_id": "52be78c05260e07c5f00001e",
                "Name": "舒热佳 至尊65UP65",
                QD: {价格: 0},
                CS: {价格: 2180}
            },
            {
                "_id": "52be78c05260e07c5f000018",
                "Name": "舒热佳 顶级70HL70",
                QD: {价格: 4999},
                CS: {价格: 0}
            },
            {
                "_id": "52be78c05260e07c5f000019",
                "Name": "舒热佳 至尊75UP75",
                QD: {价格: 2200},
                CS: {价格: 0}
            },
            {
                "_id": "52be78c05260e07c5f00001a",
                "Name": "舒热佳 经典70Silver70",
                QD: {价格: 1480},
                CS: {价格: 0}
            },
            {
                "_id": "52be78c05260e07c5f00001b",
                "Name": "舒热佳 至尊16HL16",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78c05260e07c5f00001c",
                "Name": "舒热佳 至尊36HL36",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78c05260e07c5f00001d",
                "Name": "舒热佳 至尊45UP45",
                QD: {价格: 0},
                CS: {价格: 1980}
            },
            {
                "_id": "52be78c05260e07c5f00001f",
                "Name": "舒热佳 经典13Charcoal13",
                QD: {价格: 0},
                CS: {价格: 1680}
            },
            {
                "_id": "52be78c05260e07c5f000020",
                "Name": "舒热佳 经典22Charcoal22",
                QD: {价格: 0},
                CS: {价格: 1680}
            },
            {
                "_id": "52be78c05260e07c5f000021",
                "Name": "舒热佳 经典38TrueGrey38",
                QD: {价格: 0},
                CS: {价格: 1650}
            },
            {
                "_id": "52be78c05260e07c5f000022",
                "Name": "舒热佳 经典50Charcoal50",
                QD: {价格: 0},
                CS: {价格: 1650}
            }
        ]
    };

    var bids = _.chain(global.BOs)
        .filter(function (i) {
            return i.ValuePath.indexOf('527de2cce03560290c82a981') > -1 && i._id != "527de2dde03560290c82a982";
        })
        .map(function (i) {
            return i._id;
        })
        .value();
    artCollection.find({'Define.Value': {$in: bids}}, {Name: 1, Define: 1, ExtProperties: 1}).toArray(function (e, ds) {
        var priis = [];
        _.each(ds, function (i) {
            var p = _.find(pris[i.Define.Value], function (ii) {
                return  ii._id == i._id;
            });
            var ll = {
                "BrandID": i.ExtProperties.BrandID,
                "CS": p.CS,
                "Product": {
                    "Name": i.Name,
                    "Value": i._id
                },
                "QD": p.QD
            };
            priis.push(ll);
        });
        priceCollection.insert(priis, function () {
            res.json(true);
        });
    });

};