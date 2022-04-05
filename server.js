var express = require('express');
var app = express();
const path = require('path');
app.use(express.static(path.join(__dirname + '/build')));
app.get('*', function(req, res){
  res.sendFile(__dirname + '/build/index.html');
});
app.listen(process.env.PORT || 8000);
