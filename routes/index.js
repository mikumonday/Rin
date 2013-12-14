
/*
 * GET home page.
 */
var db = require('../lib/db');

module.exports = {
  index: function(req, res){
    db.findAny(function(result) {
      res.render('index', {data: result, title: 'Rin!'});
    });
  },
  vid: function(req, res) {
    res.render('vid', { data: req.data, title: req.data.title });
  }
};
