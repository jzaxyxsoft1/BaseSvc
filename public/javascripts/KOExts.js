ko.bindingHandlers.NameValueLabel = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        element.innerHTML = '<b class="ml10">' + valueAccessor().Name() + ':</b>' + valueAccessor().Value();
    }
};
ko.bindingHandlers.DecimalCheck = {
    init: function (e, v, av, m, c) {
        $(e).blur(function () { if (this.value.isDecimal && !this.value.isDecimal()) { alert('数量格式错误!'); $(this).focus().select(); } });
    }
};

ko.bindingHandlers.CarsCell = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var v = valueAccessor();
        var s = '';
        var t = '<b class="ml10">{0}</b>({1}){2}';
        v.Cars().Foreach(function (i) { s = String.formet(t, i.Name(), i.CarTypeName(), s); });
        element.innerHTML = s;
    }
};
ko.bindingHandlers.DateSelector = {
    init: function (e, v, av, m, d) {
        var _t = $(e);
        createDTSltInputs(_t);
        var Y = $('input.DTSlt_Y', _t), M = $('input.DTSlt_M', _t), D = $('input.DTSlt_D', _t);
        Y.wrap('<span class="pr DTSlt_C"></span>');
        M.wrap('<span class="pr DTSlt_C"></span>');
        D.wrap('<span class="pr DTSlt_C"></span>');
        var vs = v()().split('/');
        Y.val(vs[0]).addClass('pr').after('<span class="pa cmbxBt">');
        M.val(vs[1]).addClass('pr').after('<span class="pa cmbxBt">');
        D.val(vs[2]).addClass('pr').after('<span class="pa cmbxBt">');
        $('span.cmbxBt', _t).each(function () {
            $(this).addClass('icon icon-arrow-s icon-blue   ').css({ 'right': 2, 'height': 17, 'top': 0, 'zIndex': 10 }).removeClass('ui-corner-all').click(function () {
                var _ti = $(this).siblings('input');
                if (_ti.autocomplete("widget").is(":visible")) { _ti.autocomplete("close"); return; }
                _ti.blur().autocomplete('search', '').focus();
            });
        });
        _t.YS = createDTSltYS(av().MinYear || null, av().MaxYear || null); _t.MS = createDTSltMS(); _t.DS = [];
        setSource(Y, _t.YS, function (o, u) { checkD(); });
        setSource(M, _t.MS, function (o, u) { checkD(); });
        checkD();
        function checkD() {
            if (!Y.val() || !M.val()) { return; }
            _t.DS = createDTSltDS(parseInt(Y.val()), parseInt(M.val()));
            if (D.val()) { if (parseInt(D.val()) > parseInt(_t.DS[_t.DS.length - 1])) { D.val(_t.DS[_t.DS.length - 1]); } }
            else { D.val('1'); }
            if (D.hasClass('ui-autocomplete-input')) { D.autocomplete('destroy'); }
            setSource(D, _t.DS, function () { });
        }
        function setSource(_o, _s, _cb) { _o.autocomplete({ source: _s, minLength: 0, select: _cb }); }
        _t.delegate('.ui-autocomplete-input', 'blur', function () {
            v()(Y.val() + (M.val() ? '/' + M.val() : '') + (D.val() ? '/' + D.val() : ''));
            if (!v()().isDate()) { alert('请输入正确日期!'); $(this).focus().select(); }
        });

    }
};
ko.bindingHandlers.CreateTimeSelector = {
    init: function (e, v, a, m, d) {
        var _t = $(e);
        createDTSltInputs(_t);
        var Y = $('input.DTSlt_Y', _t), M = $('input.DTSlt_M', _t), D = $('input.DTSlt_D', _t);
        Y.wrap('<span class="pr"></span>');
        M.wrap('<span class="pr"></span>');
        D.wrap('<span class="pr"></span>');
        Y.val(v().Item2()).addClass('pr').after('<span class="pa cmbxBt">');
        M.val(v().Item3()).addClass('pr').after('<span class="pa cmbxBt">');
        D.val(v().Item4()).addClass('pr').after('<span class="pa cmbxBt">');
        $('span.cmbxBt', _t).each(function () {
            $(this).addClass('icon icon-arrow-s icon-blue   ').css({ 'right': 2, 'height': 17, 'top': 0, 'zIndex': 10 }).removeClass('ui-corner-all').click(function () {

                var _ti = $(this).siblings('input');
                if (_ti.autocomplete("widget").is(":visible")) { _ti.autocomplete("close"); return; }
                _ti.blur().autocomplete('search', '').focus();
            });
        });
        _t.YS = createDTSltYS(); _t.MS = createDTSltMS(); _t.DS = [];
        setSource(Y, _t.YS, function (o, u) { v().Item2(parseInt(u.item.value)); checkItem4(); });
        setSource(M, _t.MS, function (o, u) { v().Item3(parseInt(u.item.value)); checkItem4(); });
        checkItem4();
        function checkItem4() {
            _t.DS = createDTSltDS(v().Item2(), v().Item3());
            if (v().Item4() > parseInt(_t.DS[_t.DS.length - 1])) { v().Item4(parseInt(_t.DS[_t.DS.length - 1])); D.val(v().Item4()); }
            if (D.hasClass('ui-autocomplete-input')) { D.autocomplete('destroy'); }
            setSource(D, _t.DS, function (o, u) { v().Item4(parseInt(u.item.value)); });
        }

        $('.ui-autocomplete-input', _t).on('blur', function (e) {
            var l = v().Item1().split(' ');
            l[0] = v().Item2() + '/' + v().Item3() + '/' + v().Item4();
            if (!l[0].isDate()) { alert('请输入正确日期!'); $(e.target).focus().select(); return false; }
            v().Item1(l[0] + ' ' + l[1]);
        });
        $('.ui-autocomplete-input', _t).on('keydown', function (e) {
            var _ti = $(this);
            if (_ti.hasClass('DTSlt_Y')) { v().Item2(_ti.val()); }
            else if (_ti.hasClass('DTSlt_M')) { v().Item3(_ti.val()); }
            else { v().Item4(_ti.val()); }
        });
        function setSource(_o, _s, _cb) { _o.autocomplete({ source: _s, minLength: 0, select: _cb }); }


    }
};
function createDTSltYS(min, max) { var i = min || new Date().getFullYear() - 54; var x = max || new Date().getFullYear() + 1; var r = []; for (var j = i; j < x; j++) { r.push(j.toString()); } return r; }
function createDTSltMS() { var r = []; for (var i = 1; i < 13; i++) { r.push(i.toString()); } return r; }
function createDTSltDS(y, m) {
    var r = []; var l = getDays(y, m);
    for (var i = 1; i < l + 1; i++) { r.push(i.toString()); } return r;
}
function createDTSltInputs(e) {
    e.append('<input type="text" class="DTSlt_Y" style="width:50px;" />');
    e.append('<input type="text" class="DTSlt_M" style="width:32px;" />');
    e.append('<input type="text" class="DTSlt_D" style="width:32px;" />');
}