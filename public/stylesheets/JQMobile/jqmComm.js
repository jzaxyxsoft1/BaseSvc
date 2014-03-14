

var GV = {};
GV.NodeSvcUrl = "http://www.jzaxyx.com:9777/";
GV.BSDExtUrl = "http://www.jzaxyx.com:8888/";
GV.bjdID = 'CurrentQuotation';
GV.userID = 'InnerUser';
var showPnl = function (id) {
    $('#' + id).show().siblings().hide();
}
var bgColor = ["bg-color-blue", "bg-color-blueDark", "bg-color-green", "bg-color-greenLight", "bg-color-greenDark", "bg-color-red", "bg-color-yellow", "bg-color-orange", "bg-color-pink", "bg-color-pinkDark", "bg-color-purple", "bg-color-darken", "bg-color-magenta", "bg-color-teal", "bg-color-redLight"];
var fgColor = ["border-color-blue", "border-color-blueLight", "border-color-blueDark", "border-color-green", "border-color-greenLight", "border-color-greenDark", "border-color-red", "border-color-yellow", "border-color-orange", "border-color-pink", "border-color-pinkDark", "border-color-purple", "border-color-darken", "border-color-magenta", "border-color-teal", "border-color-redLight"];
$.ajaxSetup({ cache: false });
String.Format = function () { var t, n, i; if (arguments.length == 0) return null; for (t = arguments[0], n = 1; n < arguments.length; n++) i = new RegExp("\\{" + (n - 1) + "\\}", "gm"), t = t.replace(i, arguments[n]); return t }, String.prototype.ToArray = function (n) { return this.split(n) }, String.prototype.isInt = function () { var n = new RegExp("^\\d+$", "g"); return n.test(this) }, String.prototype.isDecimal = function () { var n = new RegExp("^(-?\\d+)(\\.\\d+)?$", "g"); return n.test(this) }, String.prototype.isChs = function () { var n = new RegExp("^([\\u4e00-\\u9fa5]+|[a-zA-Z0-9]+)$", "g"); return n.test(this) }, String.prototype.isCellPhone = function () { return /^1[3|5|8][0-9]\d{8}$/g.test(this) }, String.prototype.IsDay = function () { var n = new RegExp(getDayExp(), "g"); return n.test(this) }, String.prototype.ToInt = function () { return this.isInt() ? parseInt(this) : 0 }, String.prototype.ToDecimal = function () { return this.isDecimal() ? parseFloat(this) : 0 }, String.prototype.ToOjbect = function () { return $.parseJSON(this) }, String.prototype.ToDate = function (n) { new Date(Date.parse(n.replace(/-/g, "/"))) }, String.prototype.Trim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, "").replace(/\s+/g, " ") }, Array.prototype.Insert = function (n, t) { this.splice(n, 0, t) }, Array.prototype.AddRange = function (n) { for (var t = 0; t < n.length; t++) this.push(n[t]) }, Array.prototype.Foreach = function (n) { for (var t = 0; t < this.length; t++) n(this[t], t) }, Array.prototype.Find = function (n) { var t; if (typeof n == "function") { for (t = 0; t < this.length; t++) if (n(this[t])) return this[t] } else for (t = 0; t < this.length; t++) if (this[t] == n) return this[t]; return null }, Array.prototype.FindAll = function (n) { for (var i = [], t = 0; t < this.length; t++) n(this[t]) && i.push(this[t]); return i }, Array.prototype.Remove = function (n) { if (typeof n == "function") { for (var t = 0; t < this.length; t++) if (n(this[t], t)) return this.splice(t, 1) } else return this.splice(n, 1) }, Array.prototype.Any = function (n) { return this.Find(n) != null }, Array.prototype.Max = function (n) { var t = 0; return this.Foreach(function (i) { t = i[n] > t ? i[n] : t }), t }, Array.prototype.Min = function (n) { var t = this[0][n]; return this.Foreach(function (i) { t = i[n] < t ? i[n] : t }), t }, Array.prototype.Select = function (n) { var i = [], r, t; if (typeof n == "string") for (t = 0; t < this.length; t++) i.push(this[t][n]); else for (t = 0; t < this.length; t++) r = n(this[t]), r && i.push(n(this[t])); return i }, Array.prototype.Sum = function (n) { for (var i = 0, t = 0; t < this.length; t++) i += typeof n == "string" ? typeof this[t][n] == "Number" ? this[t][n] : parseFloat(this[t][n]) || 0 : n(this[t], t); return i }, Array.prototype.Count = function (n) { var i, t; if (n) { for (i = 0, t = 0; t < this.length; t++) i += n(this[t]); return i } return this.length }
Array.prototype.randomSort = function () { var r = new Array(); while (this.length > 0) { var rd = Math.floor(Math.random() * this.length); r[r.length] = this[rd]; this.remove(rd); } return r; };
Number.rangeRound = function (u, l) { return parseInt(Math.random() * (u - l + 1) + l); };
Array.prototype.ToTable=function(n){for(var t=[],i=0,u=0,r=0;u<this.length;u++,r++)r==n&&(i++,r=0),t[i]=t[i]||[],t[i][r]=this[u];return t}
Array.ToTable=function(n,t){for(var i=[],r=0,f=0,u=0;f<n.length;f++,u++)u==t&&(r++,u=0),i[r]=i[r]||[],i[r][u]=n[f];return i}
function toKeyValue(obj) { var r = []; for (var i in obj) { if (typeof obj[i] == 'function') { continue; }; if (obj[i].Key != null) { r.push(obj[i]); } else r.push({ Key: i, Value: obj[i] }); } return r; }
$.fn.Autocomplete = function (o) {
    var _t = $(this);
    _t.o = { Url: o.Url, d: (o.d || {}), PageID: (o.PageID || 'pmpMain'), cb: o.cb, ProName: o.ProName };
    _t.o.flag = true;
    $(document).on("pageinit", "#" + (_t.o.PageID || 'mcc'), function () {
        _t.on("listviewbeforefilter", function (e, data) {
            var $ul = $(this),
                $input = $(data.input),
                value = $input.val(),
                html = "";
            $ul.html("");
            if (_t.o.flag && value && value.length > 2) {
                _t.o.flag = false;
                $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
                $ul.listview("refresh");
                if (_t.o.d) { _t.o.d.term = $input.val(); }
                else { _t.o.d = { term: $input.val() }; }
                $.ajax({
                    url: _t.o.Url,
                    dataType: "json",
                    data: _t.o.d
                })
                .then(function (response) {
                    _t.o.flag = true;
                    $.each(response, function (i, val) {
                        var pp = $('<li></li>');
                        pp.append(val[_t.o.ProName] || val.label || val.Name);
                        pp.click(function () { $input.val(val.Name); _t.o.cb(val); _t.html('').listview('refresh'); });
                        $ul.append(pp);
                    });
                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
                });
            }
        });
    });
};

var Cookie = { set: function (n, t) { var r = "", i; arguments[2] && (i = new Date, i.setDate(i.getDate() + arguments[2]), r = ";expires=" + i.toGMTString()), document.cookie = n + "=" + escape(t) + ";path=/" + r }, get: function (n) { var t, i; return document.cookie.length > 0 && (t = document.cookie.indexOf(n + "="), t != -1) ? (t = t + n.length + 1, i = document.cookie.indexOf(";", t), i == -1 && (i = document.cookie.length), unescape(document.cookie.substring(t, i))) : "" } }
$.fn.msg = function () {
    var n = this;
    n.cb = function () { };
    n.append('<div id="MsgContent" style="padding:20px; text-algin:center"><\/div><div class="btContainer" style="text-algin:center"><span class="bg-color-blueDark fg-color-white bt ok" style="display:inline-block; padding:10px 15px; margin:10px auto;">确定<\/span><\/div>');
    n.delegate(".bt.ok", "click", function () { n.hide(), n.cb(true) });
    n.delegate(".bt.cancel", "click", function () { n.hide(), n.cb(false) });
    n.showMsg = function (t, i) { n.cb = i; if ($('.bt.cancel', n).length > 0) { n.remove($('.bt.cancel', n)); } $("#MsgContent").html(t), n.show().siblings().hide() };
    n.confirm = function (t, i, o) {
        n.cb = i; $("#MsgContent").html(t); n.show().siblings().hide();
        if ($('.bt.cancel', n).length == 0) { $('.btContainer', n).append('<span class="bg-color-blueDark fg-color-white ml10 bt cancel" style="display:inline-block; padding:10px 15px; margin:10px auto; margin-left:10px;">取消<\/span>'); }
        if (o) { $('.bt.ok', n).text(o.y); $('.bt.cancel', n).text(o.n); }
    };
    return n;
};
Date.ToString = function () {
    var n = new Date(), t = n.getFullYear() + "/" + (n.getMonth() + 1) + "/" + n.getDate();
    return arguments[0] == null ? t : t + " " + n.getHours() + ":" + n.getMinutes() + ":" + n.getSeconds();
};
Date.ToCreateTime=function(){var n=new Date;return{Item1:Date.ToString(1),Item2:n.getFullYear(),Item3:n.getMonth()+1,Item5:n.getDate(),Item6:n.getHours(),Item7:n.getMinutes(),Item8:n.getSeconds()}}
var loading={show:function(){$("#loadinggif").length>0?$("#loadinggif").show():($("body").append('<img src="/Content/loading.gif" style=" position:absolute ; top:330px; left:580px;z-index:9999;" id="loadinggif" />'),this.flg=!0)},hide:function(){$("#loadinggif").hide()}}
function CreateValuePathArray(vp, seperator) {
    var _r = [];
    var _s = vp.split(seperator);
    while (_s.length > 0) {
        _r.push(_r.length > 0 ? _r[_r.length - 1] + seperator + _s.shift() : _s.shift());
    }
    return _r;
}
 