
var PORT_NUMBER = 19222;

var _ = require('lodash');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fs = require('fs');

var bowerMapping = [
    { name: '/js/foundation.js',            file: 'bower-foundation/js/foundation.min.js' },
    { name: '/css/normalize.css',           file: 'bower-foundation/css/normalize.css' },
    { name: '/css/foundation.css',          file: 'bower-foundation/css/foundation.min.css' },
    { name: '/js/jquery.js',                file: 'jquery/dist/jquery.min.js' },
    { name: '/js/modernizr.js',             file: 'modernizr/modernizr.js' },
    { name: '/js/lodash.js',                file: 'lodash/dist/lodash.min.js' },
    { name: '/js/angular.js',               file: 'angular/angular.js' },
    { name: '/js/angular-ui-router.js',     file: 'angular-ui-router/release/angular-ui-router.js' },
    { name: '/css/angular-csp.css',         file: 'angular/angular-csp.css' },
    { name: '/js/URI.js',                   file: 'uri.js/src/URI.min.js' },
    { name: '/js/d3.js',                    file: 'd3/d3.min.js' }
];

var apiModules = [
    './api/projects.js'
];

if(!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

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
