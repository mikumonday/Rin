/*
/ Require modules
*/

var io = require('socket.io-client'),
   cfg = require('../config'),
   log = require('../lib/log');

/*
/ connection region
*/

var socket = io.connect(config.cyserver);
socket.on('connect', function (err) {
    socket.emit('login', { name: config.cyuser, pw: config.cypw });
    log("logging in...");
    socket.emit('joinChannel', { name: config.cychannel });
    log("joining channel...");
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
socket.on("addUser", function(message, callback){
  log("cytube- " + message.name + " has joined.");
  if (message.name !== config.cyuser) {
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

/*
/ message handling region
*/

/*
/ export region
*/
module.exports.uList = uList;