'use strict';

var http = require('https');
var fs = require('fs');
var dotenv = require('dotenv');
dotenv.load();

var algorithmia = require("algorithmia");
var client = algorithmia(process.env.ALGO_API_KEY);

function BodyChecker(url_file) {
  this.url_file = url_file;
  this.folderName = process.env.ALGO_FOLDER_NAME;
  this.dir = client.dir("data://"+process.env.ALGO_USERNAME+"/"+this.folderName);
  this.result = null;
  this.callback = function(r) { console.log(r); };

  var clientDir = this.dir;
  // Create your data collection if it does not exist
  clientDir.exists(function(exists) {
    if (exists == false) {
      clientDir.create(function(response) {
        if (response && response.error) {
          return console.log("Failed to create dir: " + response.error.message);
        }
          // console.log("Created directory: " + this.dir.data_path);
        });
    } else {
      // console.log("Your directory already exists.")
    }
  });

}

BodyChecker.prototype.download = function(url, dest, cb) {
  var self = this;
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

BodyChecker.prototype.bodyCheck = function(local_file) {
  var self = this;
  var filename = "tmp.jpg";
  var snapshot = "data://"+process.env.ALGO_USERNAME+"/"+self.folderName+"/" + filename

  client.file(snapshot).exists(function(exists) {

    self.dir.putFile(local_file, function(response) {
      if (response && response.error) {
        return console.log("Failed to upload file: " + response.error.message);
      }
      // console.log("File uploaded.");
    });
  });

  setTimeout(function() {
    self.testTmpImage(snapshot);
  }, 200);
}

BodyChecker.prototype.testTmpImage = function(snapshot) {
  var self = this;
  var outputFilename = "snapshot-output.jpg";
  var output = "data://"+process.env.ALGO_USERNAME+"/"+self.folderName+"/" + outputFilename;

  client.file(snapshot).exists(function(exists) {
    if (exists == true) {
      // Set input
      var input = {
        "imageUrl": snapshot,
        "outputUrl": output
      };

      client.algo("algo://opencv/BodyDetection/1.0.0")
        .pipe(input)
        .then(function(response) {
          if (response && !response.error) {
            var rects = response.get().rectsSaveLocation;

            client.file(rects).exists(function(exists) {
              if (exists == true) {
                // Download contents of file as a string
                client.file(rects).get(function(err, data) {
                  if (err) {
                    return console.log("Failed to check rects: " + err);
                  } else {
                    // console.log("Successfully downloaded data.")
                  }

                  self.result = data.length !== 0;
                  self.callback(self.result);
                });
              }
            });
          }
        });
    }
  });
};

BodyChecker.prototype.run = function(callback) {
  var self = this;
  if (callback) {
    this.callback = callback
  }

  self.download(self.url_file, "images/tmp.jpg", function(error) {
    if (!error) {
      var local_path = this.path;
      self.bodyCheck(local_path)
    } else {
      return console.log("Failed to save tmp file: " + error);
    }
  })

};

module.exports = BodyChecker;