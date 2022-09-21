'use strict';

var express = require('express');
var expressWss = require('express-ws')(express());
var appWs = expressWss.app;
appWs.use('/',express.static('./public'));

require('./video-processor')(appWs);

var port = Number(process.env.PORT || 3000);

appWs.listen(port, function () {
    console.log('Listening on port:' + port);
});