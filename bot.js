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
var config = JSON.parse(fs.readFileSync('config.json','utf-8'));
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
	log("cytube- " + message.username + ": " + message.msg);
	if(registered == true) {
		if(message.username !== config.cyuser){
			client.say(config.ircchannel, "(" + message.username + ") " + message.msg);
		}
	}
	if(message.msg.indexOf("!") == 0) {
		commands("cytube", message.username, message.msg)
	}
});
//
//irc messages
//
client.addListener('message', function(from, to, msg) {
	log("irc- " + from + ' to ' + to + ': ' + msg);
	if(msg.indexOf("!") == 0) {
		commands("irc", from, msg)
	}
	if(to == config.ircchannel){
		socket.emit('chatMsg', {'msg': from + "@" + config.ircchannel + ": " + msg})
	}
});
function commands(source, user, message){
	//
	//commands
	//
	//test command
	if(message.indexOf("!test") == 0) {
		log("Username: " + user);
		log("Message: " + user);
		var rank = getRank();
		log("Rank: " + rank);
		var roll = getRoll();
		log("Rolled: " + roll);
	}
	//ask
	if(message.indexOf("!ask") == 0) {
		ask(message.substring(5));
	}
	//greet
	if(message.indexOf("!greet") == 0) {
		greet();
	}
	//farewell
	if(message.indexOf("!bye") == 0) {
		farewell();
	}
	//Roll
	if(message.indexOf("!roll") == 0) {
		var roll = getRoll();
		if(source == "cytube") {
			socket.emit('chatMsg', {'msg': user + " you rolled " + roll + "!"});
		}
		else {
			client.say(config.ircchannel, user + " you rolled " + roll + "!");
		}
	}
	//help
	if(message.indexOf("!help") == 0) {
		if(source == "cytube") {
			socket.emit('chatMsg', {'msg': "Commands are: !greet, !bye, !ask, !roll, !source, !help"});
		}
		else {
			client.say(config.ircchannel, "Commands are: !greet, !bye, !ask, !roll, !source, !help");
		}
	}
	//source code
	if(message.indexOf("!source") == 0) {
		if(source == "ctybe") {
			socket.emit('chatMsg', {'msg': "http://github.com/Twirlie/Rin"});
		}
		else {
			client.say(config.ircchannel, "Commands are: !greet, !bye, !ask, !roll, !source, !help");
		}
	}
	function ask(args){
		if(args.length > 0){
			var roll = getRoll();
			log("Rolled: " + roll);
			if(roll > 5) {
				if(source == "cytube"){
					socket.emit('chatMsg', {'msg': "*" + args + ":* " + "Yes"});
				}
				else {
					client.say(config.ircchannel, args + ": " + "Yes");
				}
			}
			else {
				if(source == "cytube"){
					socket.emit('chatMsg', {'msg': "*" + args + ":* " + "No"});
				}
				else {
					client.say(config.ircchannel, args + ": " + "No");
				}
			}
		}
		else {
			if(source == "cytube"){
				socket.emit('chatMsg', {'msg': "error: no arguments"});
			}
			else {
				client.say(config.ircchannel, "error: no arguments");
			}
		}
	}
	function getRank(){
		for(var i=0;i<uList.length;i++){
			if(uList[i].name == user){
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
		if(source == "cytube"){
			socket.emit('chatMsg', {'msg': "Hello " + user + "."});
		}
		else{
			client.say(config.ircchannel, "Hello " + user + ".");
		}
	}
	function farewell(){
		if(source == "cytube"){
			socket.emit('chatMsg', {'msg': "Bye " + user + "."});
		}
		else{
			client.say(config.ircchannel, "Bye " + user + ".");
		}
	}
}