/**
 * Module dependencies.
 */
var boCollection = require('mongoskin').db('localhost:4000/ECTABase?auto_reconnect').collection('BODefine');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/macvalidate');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

global.BOTool = {
    getPropertyValue: function (obj, pron) {
        for (var i in obj.Properties) {
            if (obj.Properties[i].Name == pron) {
                return obj.Properties[i].Value;
            }
        }
    },
    convertPropertiesToArray: function (obj) {
        var r = [];
        for (var i in obj.Properties) {
            r.push(obj.Properties[i]);
        }
        obj.Properties = r;
    }
};
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
var fs = require('fs');
var fiels = fs.readdirSync('./routes');
var _s = '', controllers = {};
fiels.forEach(function (f) {
    _s = f.replace(/\.js/, '');
    controllers[_s] = require('./routes/' + f);
    for (var ex  in controllers[_s]) {
        if (ex.indexOf('post') > -1) {
            app.post('/' + _s + '/' + ex, controllers[_s][ex]);
        }
        else {
            app.get('/' + _s + '/' + ex, controllers[_s][ex]);
        }
    }
})
boCollection.find({}).toArray(function (e, ds) {
    global.BOs = ds;
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
