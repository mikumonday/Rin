//nodejs cytube bot

//require modules
var io = require('socket.io-client');
var fs = require('fs');
var irc = require('irc');
var MongoClient = require('mongodb').MongoClient;
//logging
var log = function(msg) {
	d = new Date();
	d1 = d.getHours();
	d2 = d.getMinutes();
	d3 = d.getSeconds();
	d4 = d.getMilliseconds();
	if(d1 < 10){
		d1= "0" + d1;
	}
	if(d2 < 10){
		d2= "0" + d2;
	}
	if(d3 < 10){
		d3= "0" + d3;
	}
	if (d4 < 100) {
		d4= "0" + d4;
		if(d4 < 10) {
			d4= "0" + d4;
		}
	}
	console.log("[" + d1 + ":" + d2 + ":" + d3 + ":" + d4 + '] ' + msg);
};
//read config file
var config = JSON.parse(fs.readFileSync('config.json','utf-8'));
//Join server and channel
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
//get userlist
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
//connect to Database
//
var collection;
MongoClient.connect("mongodb://localhost/rin", function(err, db) {
	if(!err) {
		log("DB- Database connected");
		db.createCollection('yt', function(err, collection) {});
		coll = db.collection('yt');
	} else {
		log("DB debug- " + err);
	}
});
//
//cytube messages
//
socket.on('chatMsg', function (message, callback) {
	log("cytube- " + message.username + ": " + message.msg);
	if(registered == true) {
		if(message.username !== config.cyuser){
			client.say(config.ircchannel, "(" + message.username + ") " + message.msg);
		}
	}
	if(message.msg.indexOf(config.commandchar) == 0) {
		commands("cytube", message.username, message.msg);
	}
});
//
//irc messages
//
client.addListener('message', function(from, to, msg) {
	log("irc- " + from + ' to ' + to + ': ' + msg);
	if(msg.indexOf(config.commandchar) == 0) {
		commands("irc", from, msg);
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
	if(message.indexOf(config.commandchar + "test") == 0) {
		test(message.substring(6).split(" "));
	}
	//ask
	if(message.indexOf(config.commandchar + "ask") == 0) {
		ask(message.substring(5));
	}
	//greet
	if(message.indexOf(config.commandchar + "greet") == 0) {
		greet();
	}
	//farewell
	if(message.indexOf(config.commandchar + "bye") == 0) {
		farewell();
	}
	//Roll
	if(message.indexOf(config.commandchar + "roll") == 0) {
		var roll = getRoll();
			socket.emit('chatMsg', {'msg': user + " you rolled " + roll + "!"});
			client.say(config.ircchannel, user + " you rolled " + roll + "!");
	}
	//help
	if(message.indexOf(config.commandchar + "help") == 0) {
			socket.emit('chatMsg', {'msg': "Commands are: !greet, !bye, !ask, !roll, !add(moderator), !source, !help"});
			client.say(config.ircchannel, "Commands are: !greet, !bye, !ask, !roll, !add(moderator), !source, !help");
	}
	//source code
	if(message.indexOf(config.commandchar + "source") == 0) {
			socket.emit('chatMsg', {'msg': "http://github.com/Twirlie/Rin"});
			client.say(config.ircchannel, "http://github.com/Twirlie/Rin");
	}
	if(message.indexOf(config.commandchar + "add" ) == 0){
		add(message.substring(5).split(" "));
	}
	if(message.indexOf(config.commandchar + "addtest") == 0) {
		add(message.substring(9).split(" "));
	}
	//
	//functions
	//
	function test(args) {
		if(args.length > 0) {
			if(args[0] == "uList") {
				log(JSON.stringify(uList));
			}
			if (args[0] == "print") {
				var rank = getRank();
				var roll = getRoll();
				socket.emit('chatMsg', {"msg": "Username: " + user + " Message: " + message + " Rank: " + rank + " Roll: " + roll});
				client.say(config.ircchannel, "Username: " + user + " Message: " + message + " Rank: " + rank + " Roll: " + roll);
			}
		} else {
			log("Username: " + user);
			log("Message: " + message);
			var rank = getRank();
			log("Rank: " + rank);
			var roll = getRoll();
			log("Rolled: " + roll);
		}
	}
	function ask(args){
		if(args.length > 0){
			var roll = getRoll();
			log("Rolled: " + roll);
			if(roll > 5) {
				socket.emit('chatMsg', {'msg': "*" + args + ":* " + "Yes"});
				client.say(config.ircchannel, args + ": " + "Yes");
			}
			else {
				socket.emit('chatMsg', {'msg': "*" + args + ":* " + "No"});
				client.say(config.ircchannel, args + ": " + "No");
			}
		}
		else {
				socket.emit('chatMsg', {'msg': "error: no arguments"});
				client.say(config.ircchannel, "error: no arguments");
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
			socket.emit('chatMsg', {'msg': "Hello " + user + "."});
			client.say(config.ircchannel, "Hello " + user + ".");
	}
	function farewell(){
			socket.emit('chatMsg', {'msg': "Bye " + user + "."});
			client.say(config.ircchannel, "Bye " + user + ".");
	}
	function add(args) {
		log("cytube debug- " + "addtest: " + args + "type: " + typeof args[0]);
		var total = args[0].valueOf(), count = 0, vidData = [];
		log("cytube debug- " + total);
		if (total > 0) {
			coll.find().toArray(function(err, docs) {
				if(err) {
					log("DB debug- " + err);
				}
				if(docs !== undefined) {
					log("DB debug- " + "documents fetched");
						for(var i=0;i<docs.length;i++) {
							var roll = getRoll();
							log("cytube debug- " + "rolling for random add: " + roll);
							log("cytube debug- looping... " + "count: " + count);
							if(count < total) {
								if(roll > 5) {
									var derping = {'vid': docs[i].vid, 'site': docs[i].type, 'pos': "end"};
									vidData.push(derping);
									count++;
								}
							} else {
								log("cytube debug- vidData: " + JSON.stringify(vidData));
								addMedia(vidData);
								break;
							};
						}
				}
			});
		}
	}
	function readDB(args) {
		coll.find().toArray(function(err, docs) {
			if(err) {
				log("DB debug- " + err);
			}
		});
	}
	function addMedia(data){
		var i = 0;
			var interv = setInterval(function() {
				if(data.length > i) {
					var packet = {
						"id": data[i].vid,
						"type": data[i].site,
						"pos": data[i].pos
					}
					socket.emit("queue", packet);
					log("cytube debug- " + data[i].vid + " added");
					i++;
				} else {
					clearInterval(interv);
				}
			}, 1500);
	}
}
socket.on("queueFail", function(message){
	log("cytube debug- " + JSON.stringify(message.msg));
});
socket.on("queue", function(message){
	addToDB(message.item.media.id, message.item.media.type, message.item.queueby, message.item.media.title);
});
function addToDB(id, type, queueby, title) {
 	var doc = {"vid": id, "type": type, "user": queueby, "title": title, "forbidden": false};
 	coll.findOne({"vid": id}, function(err, result) {
 		if(err) {
 			log("DB debug- " + err);
 		}
 		if(result !== null) {
	 		if(doc.user == result.user){
	 			log("DB- " + doc.user + " already added this");
	 		} else {
	 			coll.insert(doc, {w:1}, function(err, result) {
					if(err) {
						log("DB debug- " + err);
					}
					log("DB- " + title + " added");
				});
	 		}
	 	} else {
 			coll.insert(doc, {w:1}, function(err, result) {
				if(err) {
					log("DB debug- " + err);
				}
				log("DB- " + "\"" + title + "\"" + " added");
			});
 		}
 	});
}