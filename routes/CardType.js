var db = require('DB').DB;
exports.get = function (req, res) {
    var query = req.query['query'];
    var option = req.query['option'] || {};
    var t = req.query['t'];
    switch (t) {
        case 'obj':
            db.CardType.findOne(query, option, function (e, d) {
                res.jsonp(d);
            });
            break;
        case 'objs':
            db.CardType.find(query, option).toArray(function (e, d) {
                res.jsonp(d);
            });
            break;
    }
}
