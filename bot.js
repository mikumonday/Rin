//nodejs cytube bot

//require modules
var io = require('socket.io-client');
var fs = require('fs');
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
//socket stuff(temp desc)
var socket = io.connect(config.server);
socket.on('connect', function () {
    socket.emit('login', { name: config.username, pw: config.pw });
    log("logging in...");
    socket.emit('joinChannel', { name: config.channel });
    log("joining channel...");
});
//get userlist
var uList;
socket.on('userlist', function(message, callback){
	console.dir(message);
	uList = message;
});
//log messages and chat commands
socket.on('chatMsg', function (message, callback) {
	log(message.username + ": " + message.msg);
	//get rank
	var rank = getRank();
	function getRank(){
		for(var i=0;i<uList.length;i++){
			if(uList[i].name == message.username){
				var uRank = uList[i].rank;
				return uRank;
				break;
			}
		}
	}
	//commands
	if(message.msg == "!test"){
		log("**This user's rank is " + rank);
		socket.emit('chatMsg', {'msg': "This is a test command"});	
	}
	if(message.msg == "!test2"){
		log("**This user's rank is " + rank);
		if(rank > 2){
			socket.emit('chatMsg', {'msg': message.username + " you have access!"});
		}
		else{
			socket.emit('chatMsg', {'msg': message.username + ", access denied"});
		}
	}
	if(message.msg == "!rank"){
		log("**This user's rank is " + rank);
		socket.emit('chatMsg', {'msg': message.username + ", your user rank is " + rank});
	}
});
