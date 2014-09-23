var fs = require('fs');
var url = require('url');
var path = require('path');
var lame = require('lame');
var ls = require('ls-stream');
var request = require('request');
var Speaker = require('speaker');
var ProgressBar = require('progress');

var speaker = new Speaker({
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
});

module.exports = {
  isURL: isURL,
  playUrl: playUrl,
  playLocal: playLocal,
  playFile: playFile,
  playDirectory: playDirectory
};

function playUrl(url, nodata) {
  request(url)
  .on('response', displayData)
  .pipe(new lame.Decoder())
  .pipe(speaker);
}

function isURL(url) {
  return (!!~url.indexOf('http://') || !!~url.indexOf('https://'));
}

function displayData(stream, data, cb) {
  var len, bar;

  if (stream.headers) {
    len = parseInt(stream.headers['content-length'], 10);
    bar = new ProgressBar('  playing [:bar] :percent :etas', {
      complete: '#',
      incomplete: ' ',
      width: 50,
      total: len
    });

  }

  console.log('\n');

  console.log(stream);
  stream.on('end', function () {
    if (cb) {
      cb();
    } else console.log('\n');
  });

  stream.on('data', function(chunk) {
    if (bar) bar.tick(chunk.length);
  });
}

function playLocal(path) {
  fs.lstat(path, function(err, stats) {
    if (stats.isDirectory()) {
      playDirectory(path);
    } else if (stats.isFile()) {
      playFile(path);
    } else {
      console.log('This doesn\'t appear to be a file, directory, or URL: ', path);
    }
  });
}

function playAllFiles(files, idx, cb) {
  if (idx > files.length) {
    if (cb) cb();
    return;
  }
  playFile(files[idx], function() {
    playAllFiles(files, idx + 1);
  });
}

function playDirectory(path, cb) {
  var files = [];

  ls(path)
  .on('data', function(data) {
    files.push(data.path);
  }).on('end', function() {
    playAllFiles(files, 0, cb);
  });
}

function playFile(path, cb) {
  console.log(path);
  fs.createReadStream(path)
  .on('data', function(stream) {
    // displayData(stream, null, cb);
  })
  .on('end', function() {
    if (cb) cb();
  })
  .pipe(new lame.Decoder())
  .pipe(speaker);
}