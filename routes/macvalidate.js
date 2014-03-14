var arp=require('arp');
exports.solutionv=function(q,r){
    var ip= q.query['ip'];
     arp.getMAC(ip,function(e,m){
        r.jsonp(m);
    });
};
