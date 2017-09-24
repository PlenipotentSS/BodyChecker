var BodyChecker = require('./BodyChecker.js');
var url_file = "";

process.argv.forEach(function (val, index, array) {
  if (index === 2) {
    url_file = val;
  }
});

if (url_file.indexOf("http") === 0) {
  var bc = new BodyChecker(url_file);
  bc.run(function(result) {
    console.log("callback called!")
    console.log(result);
  });
} else {
  console.log("Please give url to image");
}
