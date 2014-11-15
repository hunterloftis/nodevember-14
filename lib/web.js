var express = require('express');
var jade = require('jade');
var path = require('path');
var parallel = require('./parallel');

module.exports = function web(broker, serviceTime) {

  broker.create('weather.get');
  broker.create('map.get');
  broker.create('hits.get');
  broker.create('kitten.get');

  return express()
    .set('view engine', 'jade')
    .set('view cache', true)
    .get('/', parallel([ getWeather, getMap, getHits, getKitten ], serviceTime), renderHome);


  function getWeather(req, res, next) {
    broker.publish('weather.get', { zip: req.query.zip }, function onWeather(err, weather) {
      res.locals.weather = weather;
      next();
    });
  }

  function getMap(req, res, next) {
    broker.publish('map.get', { zip: req.query.zip }, function onMap(err, map) {
      res.locals.map = map;
      next();
    });
  }

  function getHits(req, res, next) {
    broker.publish('hits.get', {}, function onHits(err, hits) {
      res.locals.hits = hits;
      next();
    });
  }

  function getKitten(req, res, next) {
    broker.publish('kitten.get', {}, function onKitten(err, hits) {
      res.locals.kitten = kitten;
      next();
    });
  }

  function renderHome(req, res, next) {
    res.render(path.join(__dirname, 'home'));
  }
};
