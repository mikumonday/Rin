/*
/ require modules
*/
var    db = require('../lib/db'),
      log = require('../lib/log'),
   socket = require('./socketClient');

module.exports = function(message, callback) {
  var msg = message.msg,
  user = message.username,
  rank = message.rank,
  cmd = getCommand(),
  //do the work here
  command = {
    ask: function(args) {
      if(args.length > 0){
        var roll = getRoll();
        log("Rolled: " + roll);
        if(roll > 5) {
          callback(socket.emit('chatMsg', {'msg': "*" + args + ":* " + "Yes"}));
        }
        else {
          callback(socket.emit('chatMsg', {'msg': "*" + args + ":* " + "No"}));
        }
      }
      else {
          callback(socket.emit('chatMsg', {'msg': "error: no arguments"}));
      }
    },
    greet: function() {
      callback(socket.emit('chatMsg', {'msg': "Hello " + user + "."}));
    },
    bye: function() {
      callback(socket.emit('chatMsg', {'msg': "Bye " + user + "."}));
    },
    roll: function() {
      var roll = getRoll();
      callback(socket.emit('chatMsg', {'msg': user + " you rolled " + roll + "!"}));
    },
    add: function() {
      //add command
    },
    forbid: function() {
      //forbid command
    },
    protect: function() {
      //protect command
    },
    help: function() {
      callback(socket.emit('chatMsg', {'msg': "Commands are: !greet, !bye, !ask, !roll, !source, !help"}));
    },
    source: function() {
      callback(socket.emit('chatMsg', {'msg': "http://github.com/Twirlie/Rin"}));
    }
  };
  log(rank);
  switch(cmd) {
    case 'ask':
      command.ask(msg.substring(5));
      break;
    case 'greet':
      command.greet();
      break;
    case 'bye':
      command.bye();
      break;
    case 'roll':
      command.roll();
      break;
    case 'add':
      command.add();
      break;
    case 'forbid':
      command.forbid();
      break;
    case 'protect':
      command.protect();
      break;
    case 'help':
      command.help();
      break;
    case 'source':
      command.source();
      break;
  }
  function getCommand() {
    var x = msg.slice(1),
    y = x.split(" ");
    return y[0];
  }
}

function getRoll(){
  var ranNum = Math.floor((Math.random()*10)+1); 
  return ranNum;
}
