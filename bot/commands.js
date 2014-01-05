/*
/ require modules
*/
var    db = require('../lib/db'),
      log = require('../lib/log'),
      cfg = require('../config'),
   socket = require('./socketClient');

module.exports = function(message, rank) {
  var msg = message.msg,
     user = message.username,
   access = cfg.accessRank,
      cmd = getCommand(),
  //do the work here
  command = {
    ask: function(args) {
      if(args.length > 0){
        var roll = getRoll();
        if(roll > 5) {
          socket.emit('chatMsg', {'msg': "*" + args + ":* " + "Yes"});
        }
        else {
          socket.emit('chatMsg', {'msg': "*" + args + ":* " + "No"});
        }
      }
      else {
          socket.emit('chatMsg', {'msg': "error: no arguments"});
      }
    },
    greet: function() {
      socket.emit('chatMsg', {'msg': "Hello " + user + "."});
    },
    bye: function() {
      socket.emit('chatMsg', {'msg': "Bye " + user + "."});
    },
    roll: function() {
      var roll = getRoll();
      socket.emit('chatMsg', {'msg': user + " you rolled " + roll + "!"});
    },
    add: function(args) {
      var total = args.valueOf(), count = 0, queuePackages = [];
      if(total > 0) {
        db.findAny(function(result) {
          for(var i=0;i<100;i++) {
            var roll = getRoll();
            if(result.length == i) {
              i = 0;
            }
            if(count < total) {
              if(roll > 5) {
                if(result[i].forbidden === false) {
                  var queuePackage = {'vid': result[i].vid, 'site': result[i].type, 'pos': "end"};
                  queuePackages.push(queuePackage);
                  count++;
                }
              }
            } else {
              addMedia(queuePackages);
              break;
            }
          }
        });
      }
    },
    forbid: function() {
      db.updateForbid(socket.currentVideo);
      socket.emit('chatMsg', {'msg': socket.currentVideo +" is now forbidden."});
    },
    protect: function() {
      db.updateProtect(socket.currentVideo);
      socket.emit('chatMsg', {'msg': socket.currentVideo +" is now protected."});
    },
    help: function() {
      socket.emit('chatMsg', {'msg': "Commands are: !greet, !bye, !ask, !roll, !source, !help"});
    },
    source: function() {
      socket.emit('chatMsg', {'msg': "http://github.com/mikumonday/Rin"});
    }
  };
  
  //fires the commands, checks rank for access
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
      if(rank >= access) {
        log('add passes');
        command.add(msg.substring(5));
      } else {
        log('add fails ' + rank + ' ' + access);
      }
      break;
    case 'forbid':
      if(rank >= access) {
        command.forbid();
      }
      break;
    case 'protect':
      if(rank >= access) {
        command.protect();
      }
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
function addMedia(queuePackages) {
  var i = 0;
      var interv = setInterval(function() {
        if(queuePackages.length > i) {
          var packet = {
            'id': queuePackages[i].vid,
            'type': queuePackages[i].site,
            'pos': queuePackages[i].pos
          }
          socket.emit('queue', packet);
          log('cytube debug- ' + queuePackages[i].vid + ' added');
          i++;
        } else {
          clearInterval(interv);
        }
      }, cfg.addInterval);
}