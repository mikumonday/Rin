/*
/ Require modules
*/

var   io = require('socket.io-client'),
     cfg = require('../config'),
      db = require('../lib/db'),
     cmd = require('./commands'),
     log = require('../lib/log');

var current;     

/*
/ connection region
*/

var socket = io.connect(cfg.cyserver);
socket.on('connect', function (err) {
    socket.emit('login', { name: cfg.cyuser, pw: cfg.cypw });
    log("logging in as " + cfg.cyuser);
    socket.emit('joinChannel', { name: cfg.cychannel });
    log("joining channel " + cfg.cychannel);
    if(err) {
      log("cytube debug- " + err);
    }
});
//get user list
var uList = [];
socket.on('userlist', function(message, callback){
  log("grabbing userlist...");
  var joinList = message;
  log(JSON.stringify(joinList));
  for(var i=0;i<joinList.length;i++) {
    addToList(joinList[i].name, joinList[i].rank);
  }
});
//user joins
socket.on("addUser", function(message){
  log("cytube- " + message.name + " has joined.");
  if (message.name !== cfg.cyuser) {
    for(var i=0;i<uList.length;i++){
      if(uList[i].name == message.name){
        log(message.name + " is already in uList");
        break;
      }
      if (i == uList.length - 1) {
        addToList(message.name, message.rank);
        break;
      }
    }
  }
  log("Rank: " + message.rank);
});
function addToList(name, rank) {
    var user = {"name": name, "rank": rank};
    uList.push(user);
};

socket.on('queue', function(message) {
  log('getting results');
  db.findOne(message.item.media.id, function(result) {
    log('results gotten');
    log(typeof result);
    if (typeof result === "object") {
      if(result === null) {
        log('null result');
        log('creating new entry for ' + message.item.media.id);
        db.create({
            vid: message.item.media.id, 
           type: message.item.media.type, 
           user: message.item.queueby, 
          title: message.item.media.title
        });
      } else if(typeof result === undefined) {
        log('undefined result');
      } else {
        log('yes');
        var headCount = 0,
        found = false;
        for(var i = 0; i < 100; i++) {
          if(result.users[i] == message.item.queueby) {
            found = true;
            log("headcount: user found");
            break;
          }
          headCount++;
          if(headCount == result.users.length && found == false) {
            db.updateUsers({ vid: message.item.media.id, user: message.item.queueby});
            break;
          }
        }
      }
    }
  });
});
socket.on('queueFail', function(message) {
  //stuff goes here
});
socket.on('changeMedia', function(message) {
  log(message.id);
  current = message.id;
  module.exports.currentVideo = current;
});
socket.on('chatMsg', function (message) {
  log("cytube- " + message.username + ": " + message.msg);
  if(message.msg.indexOf(cfg.commandchar) === 0) {
    cmd(message, function(callback) {
      callback;
    });
  }
});

module.exports.emit = function(type, message) {
    socket.emit(type, message);
}
