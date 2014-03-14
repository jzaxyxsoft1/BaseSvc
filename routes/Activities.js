/**
 * 市场活动
 */
exports.get=function (req,res){
    var t=req.query['t'];
    switch (t){
        case 'm':
            res.render('Activities/m.ejs')
            break;
    }
}