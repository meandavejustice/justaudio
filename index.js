var Speaker = require('speaker');
var lame = require('lame');
var request = require('request');
var ProgressBar = require('progress');

var speaker = new Speaker({
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
});

var url = 'https://api.soundcloud.com/tracks/160842944/download?client_id=b45b1aa10f1ac2941910a7f0d10f8e28&oauth_token=1-16343-36709719-0e51500e5f9c728';

module.exports = function() {
  return
  request(url)
  .on('response', function(res){
    var len = parseInt(res.headers['content-length'], 10);
    console.log('\n');

    var bar = new ProgressBar('  playing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: len
    });

    res.on('end', function () {
      console.log('\n');
    });

    res.on('data', function(chunk) {
      bar.tick(chunk.length);
    });
  })
  .pipe(new lame.Decoder())
  .pipe(speaker);
}