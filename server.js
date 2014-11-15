var http = require('http');
var throng = require('throng');
var cpus = require('os').cpus().length;
var logger = require('logfmt');
var jackrabbit = require('jackrabbit');

var web = require('./web');

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var PORT = process.env.PORT || 5000;

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting server' });

  var server, broker = jackrabbit(RABBIT_URL, 1);

  broker.once('connected', listen);
  broker.once('disconnected', exit);
  process.on('SIGTERM', exit);

  function listen() {
    var app = web(broker);
    server = http.createServer(app)
    server.listen(PORT);
  }

  function exit() {
    logger.log({ type: 'info', message: 'closing server' });
    if (server) server.close(process.exit.bind(process));
    else process.exit();
  }
}
