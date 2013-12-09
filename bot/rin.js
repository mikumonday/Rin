/*
/ Require modules
*/

var socket = require('./socketClient'),
       irc = require('./ircClient'),
        db = require('../lib/db'),
       cfg = require('../config'),
       log = require('../lib/log');

/*
/ variables region
*/
var uList = socket.uList;
log('uList fetched: ' + uList);