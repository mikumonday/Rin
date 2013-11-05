//nodejs cytube bot

//require modules
var io = require('socket.io-client');
var fs = require('fs');
var irc = require('irc');
//logging
var log = function(msg) {
	d = new Date();
	d1 = d.getHours();
	d2 = d.getMinutes();
	d3 = d.getSeconds();
	if(d1 < 10){
		d1= "0" + d1;
	}
	if(d2 < 10){
		d2= "0" + d2;
	}
	if(d3 < 10){
		d3= "0" + d3;
	}
	console.log("[" + d1 + ":" + d2 + ":" + d3 + '] ' + msg);
};
//read config file
<<<<<<< HEAD
var config = JSON.parse(fs.readFileSync('config.json','utf-8'));
=======
var config = JSON.parse(fs.readFileSync('config.js','utf-8'));
>>>>>>> 2f67cda84fbecaedc228df3f7d0b698773a024f5
//Join server and channel
var socket = io.connect(config.cyserver);
socket.on('connect', function () {
    socket.emit('login', { name: config.cyuser, pw: config.cypw });
    log("logging in...");
    socket.emit('joinChannel', { name: config.cychannel });
    log("joining channel...");
});
//get userlist
var uList;
socket.on('userlist', function(message, callback){
	log("grabbing userlist...");
	uList = message;
});
//
//irc client
//
var client = new irc.Client(config.ircserver, config.ircuser, {
	channels: [config.ircchannel]
});
//register with nickserver
var registered = false;
client.addListener('registered', function() {
	log("Connected!");
	client.say('NickServ', 'identify ' + config.ircnickpass);
});
client.addListener('join', function(){
	log('Registered with NickServ');
	registered = true;
})
client.addListener('error', function(message) {
    log('error: ', message);
});
//
//log messages and chat commands
//
socket.on('chatMsg', function (message, callback) {
	log(message.username + ": " + message.msg);
	if(registered == true) {
		client.say(config.ircchannel, "(" + message.username + ") " + message.msg);
	}
	//
	//commands
	//
	//test command
	if(message.msg.indexOf("!test") == 0) {
		log("Username: " + message.username);
		log("Message: " + message.msg);
		var rank = getRank();
		log("Rank: " + rank);
		var roll = getRoll();
		log("Rolled: " + roll);
	}
	//ask
	if(message.msg.indexOf("!ask") == 0) {
		ask(message.msg.substring(5));
	}
	//greet
	if(message.msg.indexOf("!greet") == 0) {
		greet();
	}
	function ask(args){
		if(args.length > 0){
			var roll = getRoll();
			log("Rolled: ")
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
	}
	function getRank(){
		for(var i=0;i<uList.length;i++){
			if(uList[i].name == message.username){
				var uRank = uList[i].rank;
				return uRank;
				break;
			}
		}
	}
	function getRoll(){
		var ranNum = Math.floor((Math.random()*10)+1); 
		return ranNum;
	}
	function greet(){
		socket.emit('chatMsg', {'msg': "Hello " + message.username + "."});
	}
});
//
//irc messages
//
client.addListener('message', function(from, to, msg) {
	log(from + ' to ' + to + ': ' + msg);
	socket.emit('chatMsg', {'msg': from + "@" + config.ircchannel + ": " + msg})
});
