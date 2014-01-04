/*
/ Require modules
*/

var   io = require('socket.io-client'),
      db = require('../lib/db'),
     cfg = require('../config'),
     cmd = require('./commands'),
     log = require('../lib/log'),
     irc = require('./irc'),
  vocadb = require('../lib/vocadb'),
       _ = require('underscore');

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
      log("cytube- " + err);
    }
});
//get user list
var uList = [];
socket.on('userlist', function(message, callback){
  var joinList = message;
  for(var i=0;i<joinList.length;i++) {
    addToList(joinList[i].name, joinList[i].rank);
  }
});
//user joins
socket.on("addUser", function(message){
  if (message.name !== cfg.cyuser) {
    for(var i=0;i<uList.length;i++){
      if(uList[i].name == message.name){
        break;
      }
      if (i == uList.length - 1) {
        addToList(message.name, message.rank);
        break;
      }
    }
  }
});
function addToList(name, rank) {
    var user = {"name": name, "rank": rank};
    uList.push(user);
};

socket.on('queue', function(message) {
  db.findOne(message.item.media.id, function(result) {
    if (typeof result === "object") {
      if(result === null) {
        db.create({
            vid: message.item.media.id, 
           type: message.item.media.type, 
           user: message.item.queueby, 
          title: message.item.media.title
        });
      } else if(typeof result === undefined) {
      } else {
        var headCount = 0,
        found = false;
        for(var i = 0; i < 100; i++) {
          if(result.users[i] == message.item.queueby) {
            found = true;
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
  current = message.id;
  module.exports.currentVideo = current;
  db.findOne(message.id, function(result) {
    if (result !== null) {
      if(typeof result.vocaDB === 'object' || 'undefined') {
        if(_.isEmpty(result.vocaDB)) {
          vocadb.getByID(message.id, message.type, function(data) {
            log('updating vdb');
            db.updateVocaDB(message.id, data);
            if(data !== 'false') {
              vocadb.widgetUpdate(data, function(widget) {
                log('4 : ' + widget);
                socket.emit('setChannelJS', {'js': widget});
              });
            } else {
              vocadb.widgetFalse(function(widget) {
                socket.emit('setChannelJS', {'js': "FUCK YOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU"});
              });
            }
          });
        } else {
          if(result.vocaDB !== 'false') {
            vocadb.widgetUpdate(result.vocaDB, function(widget) {
              log('4 : ' + widget);
              socket.emit('setChannelJS', {'js': widget});
            });
          } else {
            socket.emit('setChannelJS', {'js': "FUCK YOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU"});
          }
        }
      }
    }
  });
});
socket.on('chatMsg', function (message) {
  irc.send(message.msg, message.user);
  if(message.msg.indexOf(cfg.commandchar) === 0) {
    cmd(message, function(callback) {
      callback();
    });
  }
});

module.exports.emit = function(type, message) {
    socket.emit(type, message);
}
