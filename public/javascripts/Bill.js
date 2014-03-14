/* 依赖 async/undersocre */

var Quotation = function (owner, car, card, creator) {
    this._id = ko.observable('');
    this.Owner = { Item1: ko.observable(owner ? owner.Item1 : ''), Item2: ko.observable(owner ? owner.Item2 : ''), Item3: ko.observable(owner ? owner.Item3 : ''), Item4: ko.observable(owner ? owner.Item4 : '') };
    this.Car = { Name: ko.observable(car ? car.Name : ''), Value: ko.observable(car ? car.Value : ''), CarType: { Name: ko.observable(car && car.CarType ? car.CarType.Name : ''), Value: ko.observable(car && car.CarType ? car.CarType.Value : '') } };
    this.Card = { InnerNum: ko.observable(card ? card.InnerNum : ''), Number: ko.observable(card ? card.Number : ''), RemainSum: ko.observable(0) };
    this.BillNum = ko.observable('');
    this.flag = ko.observable(1);
    this.Status = ko.computed(function () { return this.flag() == 9 ? '已成交' : this.flag() == 99 ? '已结算' : '待结算'; }, this);
    this.CardType = { Name: ko.observable(''), Value: ko.observable('') };
    this.Creator = { Item1: ko.observable(creator ? creator.Item1 : ''), Item2: ko.observable(creator ? creator.Item2 : ''), Item3: ko.observable(creator ? creator.Item3 : '') };
    this.Remark = ko.observable('');
    this.Mileage = ko.observable('');
    this.Items = ko.observableArray([]);
    this.CombinedSum = ko.observable(0);
    this.IsCombined = ko.observable((arguments.length) && (typeof arguments[arguments.length - 1] == 'boolean' && arguments[arguments.length - 1]));
    this.Sum = ko.computed(function () { return this.Items().Sum(function (iii) { return iii.Sum(); }); }, this);
    this.RecSum = ko.computed(function () { return this.Items().Sum(function (iii) { return iii.RecSum(); }); }, this);
    this.YHSum = ko.computed(function () { return this.Items().Sum(function (iii) { return iii.YHSum(); }); }, this);
    this.CreateTime = Date.ToCreateTime();
  
};
Quotation.Create = function (d) {
    var _b = new Quotation(d.Owner, d.Car, d.Card, d.Creator);
    _b._id(d._id || '');
    _b.CardType.Name(d.CardType.Name);
    _b.CardType.Value(d.CardType.Value);
    _b.CreateTime = d.CreateTime;
    _b.Department = d.Department;
    _b.Mileage(d.Mileage || '');
    _b.Remark(d.Remark || '');
    _b.OrgID = d.OrgID;
    _b.BillNum(d.BillNum || '');
    _b.flag(d.flag || 1);
    d.Items.Foreach(function (i) {
        _b.Items.push(Quotation.CreateItem(i));
    });
    return _b;
};
Quotation.Update = function (d, bill) {
    //bill = new Quotation(d.Owner, d.Car, d.Card, d.Creator); 
    bill._id(d._id || '');
    bill.Car.Name(d.Car.Name);
    bill.Car.Value(d.Car.Value);
    bill.Car.CarType.Name(d.Car.CarType.Name);
    bill.Car.CarType.Value(d.Car.CarType.Value);
    bill.Card.Number(d.Card.Number);
    bill.Card.InnerNum(d.Card.InnerNum);
    bill.Card.RemainSum(Math.round(typeof d.Card.RemainSum == 'string' ? parseFloat(d.Card.RemainSum) : d.Card.RemainSum, 2));
    bill.CardType.Name(d.CardType.Name);
    bill.CardType.Value(d.CardType.Value);
    bill.Owner.Item1(d.Owner.Item1);
    bill.Owner.Item2(d.Owner.Item2);
    bill.Owner.Item3(d.Owner.Item3);
    bill.Owner.Item4(d.Owner.Item4);
    bill.Creator.Item1(d.Creator.Item1);
    bill.Creator.Item2(d.Creator.Item2);
    bill.Creator.Item3(d.Creator.Item3);
    bill.CreateTime = d.CreateTime;
    bill.BillNum(d.BillNum || '');
    bill.flag(d.flag || 1);
    bill.Department = d.Department;
    bill.Mileage(d.Mileage || '');
    bill.Remark(d.RemainSum || '');
    bill.OrgID = d.OrgID;
    bill.IsCombined(d.IsCombined || false);
    bill.CombinedSum(d.CombinedSum ? d.CombinedSum : 0);
    bill.Items.removeAll();
    d.Items.Foreach(function (i) {
        bill.Items.push(Quotation.CreateItem(i));
    });

};
Quotation.CreateItem = function (d) {
    var bi = new QuotationItem(d.RelativeObj, d.UnitPrice, d.Amount, d.Discount, d.Model, d.Unit, d.AmountEditable);
    if (d.Price) { bi.UnitPrice(d.Price); }
    if (d.ValuePath) { bi.RelativeObj.Item4(d.ValuePath); }
    bi.Remark(d.Remark || '');
    bi.Deleteable(d.Deleteable);
    bi.flag(d.flag || 1);
    bi.ExtObjNum(d.ExtObjNum || '');
    bi.Remark(d.Remark || '');
    return bi;
};
Quotation.LoadItem = function (type, objID, carType, cardType, callback) {
    var r = [];
    type = type.indexOf('.') > -1 ? _.last(type.split('.')) : type;
    async.parallel({
        obj: function (_ocb) {
            var qo = { tp: type, query: { _id: objID } };
            if (carType) { qo.ct = carType; }
            $.getJSON(GV.NodeSvcUrl + 'Commodity/getprice?callback=?', qo, function (_ods) {
                _ocb(null, _ods);
            });
        },
        dis: function (_ocb) {
            if (cardType == '') { _ocb(null, 1); return; }
            $.getJSON(GV.NodeSvcUrl + 'Discount/get?callback=?', { t: 'obj', tp: type, id: objID }, function (_ods) {
                var r = 1;
                var l = _.find(_ods, function (i) { return i.Item1 == cardType; });
                if (l) { r = l.Item3; }
                _ocb(null, r);
            });
        }
    }, function (e, res) {
        var obj = res.obj[0];
        var it = new QuotationItem();
        if (obj) {
            it = new QuotationItem({ Item1: obj._id, Item2: obj.Name, Item3: obj.TypeFullName, Item4: obj.ValuePath }, obj.Price.CarTypePrice || obj.Price.DefaultPrice, 1, res.dis, obj.Model, obj.Unit, true);
            it.flag(obj.flag || 1);
            it.ExtObjNum(obj.ExtObjNum || '');
            it.Remark(obj.Remark || '');
            it.Deleteable(obj.Deleteable);
        }
        callback(null, it);
    });

};
Quotation.LoadItems = function (type, query, carTypes, callback) {
    var qo = { tp: type, query: { _id: { $in: ids } } };
    if (carType) { qo.ct = carType; }
    qo.query = JSON.stringify(qo.query);
    $.getJSON(GV.NodeSvcUrl + 'Commodity/getprice?callback=?', qo, function (ds) {
        var _r = [];
        _.each(ds, function (obj) {
            var bi = new QuotationItem({ Item1: obj._id, Item2: obj.Name, Item3: obj.TypeFullName, Item4: obj.ValuePath }, obj.Price.CarTypePrice || obj.Price.DefaultPrice, 1, 1, obj.Model, obj.Unit, true);
            bi.flag(obj.flag || 1);
            bi.ExtObjNum(obj.ExtObjNum || '');
            bi.Remark(obj.Remark || '');
            bi.Deleteable(obj.Deleteable);
            _r.push(bi);
        });
        callback(null, _r);
    });
};

var QuotationItem = function (relativeObj, unitPrice, amount, discount, model, unit, amountEditable) {
    this.RelativeObj = { Item1: ko.observable(relativeObj ? relativeObj.Item1 : ''), Item2: ko.observable(relativeObj ? relativeObj.Item2 : ''), Item3: ko.observable(relativeObj ? relativeObj.Item3 : ''), Item4: ko.observable(relativeObj ? relativeObj.Item4 : '') };
    this.UnitPrice = ko.observable(unitPrice || 0);
    this.Amount = ko.observable(amount || 0);
    this.Discount = ko.observable(discount || 1);
    this.DiscountTxt = ko.computed(function () { return this.Discount() == 1 ? '无' : this.Discount() * 10 + '折'; }, this);
    this.Model = ko.observable(model || '');
    this.Unit = ko.observable(unit || '');
    this.Remark = ko.observable(''); 
    this.Deleteable = ko.observable(true); 
    this.ExtObjNum = ko.observable('');
    this.flag = ko.observable(1);
    this.Sum = ko.computed(function () { return Math.round(this.UnitPrice() * this.Amount(), 2); }, this);
    this.RecSum = ko.computed(function () { return Math.round(this.Sum() * this.Discount(), 2); }, this);
    this.YHSum = ko.computed(function () { return this.Sum() - this.RecSum(); }, this);
    this.AmountEditable = ko.observable(amountEditable || false);
  
};
var DiscountObj = function (price, amout) {
    this.Price = ko.observable(price || 0);
    this.Amount = ko.observable(amout || 1);
    this.Items = ko.observableArray([]);
};
var DiscountItem = function (name, disount, parent) {
    this.Name = name;
    this.Parent = parent;
    this.Discount = ko.observable(disount);
    this.DiscountTxt = ko.computed(function () { return this.Discount() + '折' }, this);
    this.Sum = ko.computed(function () { return this.Parent.Price() * this.Parent.Amount(); }, this);
    this.RealSum = ko.computed(function () { return this.Sum() * this.Discount(); }, this);
    this.YH = ko.computed(function () { return this.Sum() - this.RealSum(); }, this);
};

var CompareComputer = function (baseValue, compareValue, amount) {
    this.BaseValueTxt = ko.observable('');
    this.CompareValueTxt = ko.observable('');
    this.AmountTxt = ko.observable('');
    this.ResultTxt = ko.observable('');
    this.BaseValue = ko.observable(baseValue || 0);
    this.CompareValue = ko.observable(compareValue || 0);
    this.Amounts = ko.observable(amount || 1);
    this.Result = ko.computed(function () {
        return Math.round((this.BaseValue() - this.CompareValue()) * this.Amounts(), 2);
    }, this);
};