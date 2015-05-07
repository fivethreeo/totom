var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + 'server/')).listen(8080);