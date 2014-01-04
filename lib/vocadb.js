//vocadb

var http = require('http'),
     log = require('./log'),
       _ = require('underscore');

module.exports = {
  getByID: function(vidID, type, callback) {
    if(type == 'yt' || type == 'vi') {
      var options = {
        hostname: 'vocadb.net',
        port: 80,
        path: '/Api/v1/Song/ByPV?pvID=' + vidID + '&Service=' + getService() + '&lang=romaji&IncludeAlbums=False&includeTags=False',
        method: 'GET'
      };
      var req = http.request(options, function(res) {
        res.on('data', function(chunk) {
          var herp = JSON.stringify(chunk);
          if(herp !== '[110,117,108,108]') {
            var vDB = JSON.parse(chunk);
            var data = {
              artists: vDB.Artists,
              id: vDB.Id,
              names: vDB.Names
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
  widgetUpdate: function(vocadb, callback) {
    var widgetData = "$('#yukarin').remove();" + 
                     "$('#queue_align2').prepend" + 
                     "(\"<div id='yukarin' class='well well-small'>";
    log('0');

    var update = getTitles(function(titles) {
      log('titles = ' + titles);
      widgetData = widgetData + titles;
      getArtists(function(artistsGroups) {
        log('artists = ' + JSON.stringify(artistsGroups));
        var artistsString = '';
        var count = 0;
        Object.keys(artistsGroups).forEach(function(key) {
          getStuffie(artistsGroups[key], function(stuffie) {
            artistsString = artistsString + "<span class='vdbgray'>" + key + " </span>" + stuffie;
            count++;
          });
        });
        if(herpycount === Object.keys(artistsGroups).length) {
          widgetData = widgetData + artistsGroups;
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
      log('1');
      var titles = "<span class='vdbgray'>/</span> ";
      for(var i = 0; i < vocadb.names.length; i++) {
        titles = titles + vocadb.names[i].Value + " <span class='vdbgray'>/</span> ";
        if(i === vocadb.names.length - 1) {
          titles = titles + '</br>';
          next(titles);
        }
      }
    }

    function getArtists(next) {
      log('2');
      var artistsBox = [];
      for(var i = 0; i < vocadb.artists.length; i++) {
        if(vocadb.artists[i].Artist === null) {
          i++
        } else {
          var artist = {
            name: vocadb.artists[i].Artist.Name,
            type: vocadb.artists[i].Artist.ArtistType
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
      log('3');
      //adds link to the widgetData
      var ID = "<a href='http://vocadb.net/S/" + vocadb.id + "' target='blank' title='link by: Yukari' " + 
               "button class = 'btn btn-mini btn-info vdb_btn'>" + vocadb.id + "</a>" + "\");";
      data = data + ID;
      //sends it 
      callback(data);
    }
  },
  widgetFalse: function(callback) {
    callback("$('#yukarin').remove();$('#queue_align2').prepend(\'<div id='yukarin' class='well well-small'></br><a target='_blank' button class='btn btn-mini btn-warning vdb_btn' href='https://github.com/d-dd/cyNaoko/blob/master/README.md#VocaDB'>?</a>     <a target='_blank' href='http://vocadb.net/' button class='btn btn-mini btn-info vdb_btn'>VocaDB</a><div>\');");
  }
};

