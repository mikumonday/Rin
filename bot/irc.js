//bot irc.js

var  irc = require('irc'),
     cfg = require('../config.js'),
     cmd = require('./commands'),
     log = require('../lib/log'),
  socket = require('./socketClient.js');

if(cfg.irc.onByDefault) {
  log('irc on');
  var client = new irc.Client(cfg.irc.server, cfg.irc.nick, {
    channels: [cfg.irc.channel],
  });
  log('Joining ' + cfg.irc.channel + ' as ' + cfg.irc.nick + ' on ' + cfg.irc.server);

  client.addListener('message' + cfg.irc.channel, function(from, msg) {
    socket.emit('chatMsg', {'msg': '(' + from + ') ' + msg});
  });
  client.addListener('join', function(channel, nick, message) {
    log(nick + ' joined ' + channel);
  });
  var registered = false;
  client.addListener('registered', function() {
    log("Connected!");
    client.say('NickServ', 'identify ' + config.irc.pw);
  });
  client.addListener('join', function(){
    log('Registered with NickServ');
    registered = true;
  })
  client.addListener('error', function(message) {
      log('error: ', message);
  });
}

module.exports = {
  send: function(msg, from) {
    if(cfg.irc.onByDefault) {
      client.say(cfg.irc.channel, '(' + from + ') ' + msg);
    }
  }
}
