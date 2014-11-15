var jackrabbit = require('jackrabbit');
var logger = require('logfmt');

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

var broker = jackrabbit(RABBIT_URL, 1);
broker.once('connected', create);

function create() {
  broker.create('foo.get', serve);
}

function serve() {
  logger.log({ type: 'info', message: 'serving foo' });

  broker.handle('foo.get', function getFoo(message, reply) {
    logger.log({ type: 'info', message: 'sending "Bar"' });
    reply('Bar');
  });
}
