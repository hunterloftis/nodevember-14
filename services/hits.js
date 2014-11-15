var jackrabbit = require('jackrabbit');
var logger = require('logfmt');
var hits = require('hits-js');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

var hits = 0;

throng(start, { workers: 1, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting hits service' });

  var broker = jackrabbit(RABBIT_URL, 1);
  broker.once('connected', create);
  process.once('uncaughtException', onError);

  function create() {
    broker.create('hits.get', serve);
  }

  function serve() {
    logger.log({ type: 'info', message: 'serving hits' });

    broker.handle('hits.get', function getWeather(message, reply) {
      var timer = logger.time('hits.get').namespace(message);
      timer.log();
      reply(++hits);
    });
  }

  function onError(err) {
    logger.log({ type: 'error', service: 'hits', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing hits' });
    process.exit();
  }
}
