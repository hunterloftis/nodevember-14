var express = require('express');
var jade = require('jade');
var path = require('path');
var parallel = require('./parallel');

module.exports = function web(broker) {

  broker.create('weather.get');
  broker.create('map.get');
  broker.create('ad.get');
  broker.create('user.get');

  return express()
    .set('view engine', 'jade')
    .set('view cache', true)
    .get('/', parallel([ getWeather, getMap, getAd ], 1000), renderHome);


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

  function getAd(req, res, next) {
    broker.publish('ad.get', { interest: req.query.interest }, function onAd(err, ad) {
      res.locals.ad = ad;
      next();
    });
  }

  function renderHome(req, res, next) {
    res.render(path.join(__dirname, 'home'));
  }
};
