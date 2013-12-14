
/**
 * Module dependencies.
 */

var express = require('express'),
     routes = require('./routes'),
       user = require('./routes/user'),
       http = require('http'),
       path = require('path'),
     socket = require('./bot/socketClient'),
         db = require('./lib/db'),
        cfg = require('./config'),
        log = require('./lib/log');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.param(':pageId', function(req, res, next, pageId) {
  db.findWithPage(pageId, function(result) {
    req.data = result;
    req.pageId = Number(pageId);
    if(result.length < pageId) {
      req.pageEnd = true;
    } else {
      req.pageEnd = false;
    }
    next();
  });
});
app.get('/:pageId', routes.page);
app.get('/', routes.index);

app.param('vidId', function(req, res, next, vidId) {
  db.findOne(vidId, function(result) {
    req.data = result;
    next();
  });
});
app.get('/vid/:vidId', routes.vid);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
