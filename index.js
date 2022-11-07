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

	server.listen(8080, '0.0.0.0', () => console.log('HTTP successful on port ' + config.port));
  httpsServer.listen(8443, '0.0.0.0', () => console.log('HTTPS successful on port 443.'));
} else {
  server.listen(config.port, '0.0.0.0', () => console.log('HTTP successful on port ' + config.port));
}