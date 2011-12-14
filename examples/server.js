
var express = require('express');
var app = express.createServer();

require('./controller.js').route(app);

app.listen(80);