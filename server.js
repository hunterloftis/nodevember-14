var http = require('http');
var throng = require('throng');
var cpus = require('os').cpus().length;
var logger = require('logfmt');
var jackrabbit = require('jackrabbit');

http.globalAgent.maxSockets = Infinity;

var web = require('./lib/web');

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var PORT = process.env.PORT || 5000;
var SERVICE_TIME = process.env.SERVICE_TIME || 500;

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting server' });

  var server, broker = jackrabbit(RABBIT_URL, 1);

  broker.once('connected', listen);
  broker.once('disconnected', exit.bind(this, 'disconnected'));
  process.on('SIGTERM', exit);

  function listen() {
    var app = web(broker, SERVICE_TIME);
    server = http.createServer(app)
    server.listen(PORT);
  }

  function exit(reason) {
    logger.log({ type: 'info', message: 'closing server', reason: reason });
    if (server) server.close(process.exit.bind(process));
    else process.exit();
  }
}
