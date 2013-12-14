
/*
 * GET home page.
 */
var db = require('../lib/db');

module.exports = {
  index: function(req, res){
    var docs;
    db.findAny(function(result) {
      docs = result;
      res.render('index', {data: docs, title: 'Rin!'});
    });
  },
  vid: function(req, res) {
    res.render('vid', { data: req.data, title: req.data.title });
  }
};