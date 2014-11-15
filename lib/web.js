var express = require('express');
var jade = require('jade');
var parallel = require('./parallel');

module.exports = function web(broker) {

  broker.create('weather.get');
  broker.create('map.get');
  broker.create('ad.get');
  broker.create('user.get');

  return express()
    .get('/', parallel([ getWeather, getMap, getAd ], 300), renderHomepage);


  function getWeather(req, res, next) {
    broker.publish('weather.get', { zip: req.query.zip }, function onWeather(err, weather) {
      res.weather = weather;
      next();
    });
  }

  function getMap(req, res, next) {
    broker.publish('map.get', { zip: req.query.zip }, function onMap(err, map) {
      res.map = map;
      next();
    });
  }

  function getAd(req, res, next) {
    broker.publish('ad.get', { interest: req.query.interest }, function onAd(err, ad) {
      res.ad = ad;
      next();
    });
  }

  function renderHomepage(req, res, next) {
    res.send([res.weather, res.map, res.ad].join(', '));
  }
};
