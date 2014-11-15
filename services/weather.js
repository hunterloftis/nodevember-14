var jackrabbit = require('jackrabbit');
var logger = require('logfmt');
var weather = require('weather-js');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting weather service' });

  var broker = jackrabbit(RABBIT_URL, 1);
  broker.once('connected', create);
  process.once('uncaughtException', onError);

  function create() {
    broker.create('weather.get', serve);
  }

  function serve() {
    logger.log({ type: 'info', message: 'serving weather' });

    broker.handle('weather.get', function getWeather(message, reply) {
      var timer = logger.time('weather.get').namespace(message);
      weather.find({ search: message.zip, degreeType: 'F' }, function(err, result) {
        var temp = result && result[0] && result[0].current.temperature;
        timer.log();
        if (err || !result) return reply();
        reply("It's currently " + temp + " degrees in " + message.zip);
      });
    });
  }

  function onError(err) {
    logger.log({ type: 'error', service: 'weather', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing weather' });
    process.exit();
  }
}
