const config = require('./config');

const path = require('path');
const fs = require('fs');

const https = require('https');

const express = require('express');

const server = express();

server.use('/', express.static(path.resolve('./public/')));

server.use('/api', require('./api'));

if (config.https) {
  const httpsServer = https.createServer({
    key: fs.readFileSync(config.keyPath),
    cert: fs.readFileSync(config.certPath),
  }, server);

	server.listen(config.httpPort, '0.0.0.0', () => console.log('HTTP successful on port ' + config.httpPort));
  httpsServer.listen(config.httpsPort, '0.0.0.0', () => console.log('HTTPS successful on port ' + config.httpsPort));
} else {
  server.listen(config.httpPort, '0.0.0.0', () => console.log('HTTP successful on port ' + config.httpPort));
}