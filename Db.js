var db = require('mongoskin').db('http://localhost:4000/test');
exports.Bill = db.collection('Bill');