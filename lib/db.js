/*
/ require modules
*/
var mongoose = require('mongoose'),
         log = require('./log'),
      Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/cybot');

var videoSchema = new Schema({
        vid: String,
       type: String,
      users: [String],
      title: String,
  forbidden: Boolean,
    protect: Boolean
});

var video = mongoose.model('video', videoSchema);

//search query
module.exports = {
  findOne: function(vidId, callback) {
    log('findOne testing ' + vidId);
    log('searching');
    video.findOne({ vid: vidId }, 'vid type users title forbidden protect', function(err, result) {
      if(err) log('video.findOne ERR: ' + err);
      if(result === null) {
        log('video ' + vidId + ' results null');
      } else {
        log(typeof result + JSON.stringify(result));
        log('result found for ' + vidId);
      }
      callback(result);
    });
  },
  create: function(vidData) {
    var vidDoc = new video({
           vid: vidData.vid,
          type: vidData.type,
         users: [vidData.user],
         title: vidData.title,
     forbidden: false,
       protect: false
    });
    vidDoc.save(function(err) {
      if(err) log('video.save ERR: ' + err);
    })
  },
  update: function(vidData) {
    video.update({ vid: vidData.vid }, { $push: { users: vidData.user } }, function(err, result) {
      if(err) log('video.update ERR: ' + err);
    })
  }
}