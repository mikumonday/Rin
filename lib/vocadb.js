//vocadb

var http = require('http'),
     log = require('./log'),
     cfg = require('../config'),
  socket = require('../bot/socketClient'),
       _ = require('underscore');

var heads = {
  'User-Agent': 'Rinbot by Twirlie',
  'Accept': 'application/json'
};

module.exports = {
  getByService: function(vidID, type, callback) {
    if(type == 'yt' || type == 'vi') {
      var options = {
        hostname: 'vocadb.net',
        port: 80,
        path: '/api/songs/?pvID=' + vidID + '&Service=' + getService() + '?fields=artists,names',
        method: 'GET'
      };
      var req = http.request(options, function(res) {
        res.on('data', function(chunk) {
          var herp = JSON.stringify(chunk);
          if(herp !== '[110,117,108,108]') {
            log(chunk);
            var vDB = JSON.parse(chunk);
            var data = {
              artists: vDB.artists,
              id: vDB.id,
              names: vDB.names
            };
            callback(data);
          } else {
            callback('false');
          }
        });
      });
      req.end();
    } else {
      callback('false');
    }
    function getService() {
      if(type == 'yt') {
        return 'Youtube';
      } else {
        return 'Vimeo';
      }
    }
  },
  getById: function(cmd, callback) {
    var options = {
        hostname: 'vocadb.net',
        port: 80,
        path: '/api/songs/' + cmd + '?fields=artists,names',
        method: 'GET'
      };
    log(cmd + ' ' + cmd.length);
    var req = http.request(options, function(res) {
      if(res.statusCode === 200) {
        res.on('data', function(chunk) {
        var herp = JSON.stringify(chunk);
        log(chunk);
        if(herp !== '[110,117,108,108]') {
          var vDB = JSON.parse(chunk);
          var data = {
            artists: vDB.artists,
            id: vDB.id,
            names: vDB.names
          };
          callback(data);
        } else {
          callback('false');
        }
      });
      }
    });
    req.end();
  },
  widgetUpdate: function(vocadb, callback) {
    var widgetData = "$('#yukarin').remove();" + 
                     "$('#queue_align2').prepend" + 
                     "(\"<div id='yukarin' class='well well-small'>";

    var update = getTitles(function(titles) {
      widgetData = widgetData + titles;
      getArtists(function(artistsGroups) {
        var artistsString = '';
        var count = 0;
        Object.keys(artistsGroups).forEach(function(key) {
          getStuffie(artistsGroups[key], function(stuffie) {
            artistsString = artistsString + "<span class='vdbgray'>" + key + " </span>" + stuffie;
            count++;
          });
        });
        if(count === Object.keys(artistsGroups).length) {
          widgetData = widgetData + artistsString;
          sendIt(widgetData);
        }
      });
    });
    function getStuffie(data, next) {
      var stuffie = '';
      for(var i = 0; i < data.length; i++) {
        stuffie = stuffie + data[i].name + ' ';
        if(i === data.length - 1) {
          next(stuffie);
        }
      }
    }
    function getTitles(next) {
      var titles = "<span class='vdbgray'>/</span> ";
      for(var i = 0; i < vocadb.names.length; i++) {
        titles = titles + vocadb.names[i].value + " <span class='vdbgray'>/</span> ";
        if(i === vocadb.names.length - 1) {
          titles = titles + '</br>';
          next(titles);
        }
      }
    }

    function getArtists(next) {
      var artistsBox = [];
      for(var i = 0; i < vocadb.artists.length; i++) {
        if(vocadb.artists[i].Artist === null) {
          i++
        } else {
          var artist = {
            name: vocadb.artists[i].name,
            type: vocadb.artists[i].categories
          };
          artistsBox.push(artist);
        } 
        if(i === vocadb.artists.length - 1) {
          var artists = _.groupBy(artistsBox, 'type');
          next(artists);
        }
      }
    }
    function sendIt(data) {
      //adds link to the widgetData
      var ID = "<a href='http://vocadb.net/S/" + vocadb.id + "' target='blank' title='link by: Yukari' " + 
               "class='btn btn-mini btn-info vdb_btn'>VocaDB</a>" + 
               " <a href='http://" + cfg.host + ":" + cfg.express.port + "/vid/" + socket.current() + "' target='blank' class='btn btn-mini btn-warning vdb_btn'>Rin</a>\");";
      data = data + ID;
      //sends it 
      callback(data);
    }
  }
};
