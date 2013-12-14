
/*
 * GET home page.
 */
var db = require('../lib/db');

module.exports = {
  index: function(req, res){
    res.redirect('/0');
  },
  page: function(req, res) {
    res.render('index', {data: req.data, pageId: req.pageId, pageEnd: req.pageEnd, title: 'Rin!'});
  },
  vid: function(req, res) {
    res.render('vid', { data: req.data, title: req.data.title });
  }
};
