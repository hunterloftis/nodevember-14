var jackrabbit = require('jackrabbit');
var logger = require('logfmt');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting foo service' });

  var broker = jackrabbit(RABBIT_URL, 1);
  broker.once('connected', create);
  process.once('uncaughtException', onError);

  function create() {
    broker.create('foo.get', serve);
  }

  function serve() {
    logger.log({ type: 'info', message: 'serving foo' });

    broker.handle('foo.get', function getWeather(message, reply) {
      var timer = logger.time('foo.get').namespace(message);
      setTimeout(function onFoo() {
        timer.log();
        reply('Bar');
      }, 100);
    });
  }

  function onError(err) {
    logger.log({ type: 'error', service: 'foo', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing foo' });
    process.exit();
  }
}
