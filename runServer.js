var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname));

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Server started http://%s:%s", host, port)

});


app.get('/jquery', function(req, res) {
  res.sendFile(path.join('jquery/index.html'));
});
app.get('/angular', function(req, res) {
  res.sendFile(path.join('angular/index.html'));
});
app.get('/angular/*', function(req, res) {
  res.redirect('/angular');
});
app.get('/', function(req, res) {
  res.redirect('/angular');
});
