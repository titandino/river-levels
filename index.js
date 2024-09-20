import express from 'express';
import path from 'path';
import apiRouting from './api.js';
const server = express();

server.use('/', express.static(path.resolve('./public/')));

server.use('/api', apiRouting);

server.listen(process.env.PORT || 8080, '0.0.0.0', () => console.log('HTTP successful on port ' + process.env.PORT || 8080));