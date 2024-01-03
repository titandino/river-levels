const path = require('path');
const express = require('express');
const server = express();

server.use('/', express.static(path.resolve('./public/')));

server.use('/api', require('./api'));

server.listen(process.env.PORT || 8080, '0.0.0.0', () => console.log('HTTP successful on port ' + process.env.PORT || 8080));