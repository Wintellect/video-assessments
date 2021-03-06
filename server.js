
var PORT_NUMBER = 19222;

var _ = require('lodash');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');

var bowerMapping = [
    { name: '/js/foundation.js',                    file: 'foundation/js/foundation/foundation.js' },
    { name: '/js/foundation.reveal.js',             file: 'foundation/js/foundation/foundation.reveal.js' },
    { name: '/css/normalize.css',                   file: 'foundation/css/normalize.css' },
    { name: '/css/foundation.css',                  file: 'foundation/css/foundation.css' },
    { name: '/js/jquery.js',                        file: 'jquery/dist/jquery.min.js' },
    { name: '/js/modernizr.js',                     file: 'modernizr/modernizr.js' },
    { name: '/js/lodash.js',                        file: 'lodash/dist/lodash.min.js' },
    { name: '/js/angular.js',                       file: 'angular/angular.js' },
    { name: '/js/angular-ui-router.js',             file: 'angular-ui-router/release/angular-ui-router.js' },
    { name: '/css/angular-csp.css',                 file: 'angular/angular-csp.css' },
    { name: '/js/URI.js',                           file: 'uri.js/src/URI.min.js' },
    { name: '/js/d3.js',                            file: 'd3/d3.min.js' },
    { name: '/js/vendor/jquery.ui.widget.js',       file: 'jquery-file-upload/js/vendor/jquery.ui.widget.js' },
    { name: '/js/jquery.iframe-transport.js',       file: 'jquery-file-upload/js/jquery.iframe-transport.js' },
    { name: '/js/jquery.fileupload.js',             file: 'jquery-file-upload/js/jquery.fileupload.js' },
    { name: '/js/video.js',                         file: 'videojs/dist/video-js/video.js' },
    { name: '/css/video-js.css',                    file: 'videojs/dist/video-js/video-js.min.css' },
    { name: '/js/video-js.swf',                     file: 'videojs/dist/video-js/video-js.swf' },
    { name: '/css/font/vjs.eot',                    file: 'videojs/dist/video-js/font/vjs.eot' },
    { name: '/css/font/vjs.svg',                    file: 'videojs/dist/video-js/font/vjs.svg' },
    { name: '/css/font/vjs.ttf',                    file: 'videojs/dist/video-js/font/vjs.ttf' },
    { name: '/css/font/vjs.woff',                   file: 'videojs/dist/video-js/font/vjs.woff' }
];

var apiModules = [
    './api/projects.js',
    './api/video.js'
];

if(!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(busboy());

_.each(bowerMapping, function(m) {
    app.get(m.name, function(req, res) {
        res.sendfile('bower_components/' + m.file);
    });
});

_.each(apiModules, function(name) {
    var m = require(name);
    if(_.isFunction(m.initializer)) {
        m.initializer(app);
    }
});

app.use(serveStatic('web', {
    'index': ['index.html']
}));

var server = app.listen(PORT_NUMBER, function() {
    console.log('----------------------------------------------------');
    console.log('Server running, navigate to:');
    console.log('http://localhost:%d/', server.address().port);
    console.log('----------------------------------------------------');
});
