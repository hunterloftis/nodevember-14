module.exports = function parallel(middlewares, time) {

  return function parallelMiddleware(req, res, next) {
    var results = 0;
    var goneNext = false;
    var timeout = setTimeout(goNext, time);

    middlewares.forEach(function(middleware) {
      middleware(req, res, onDone);
    });

    function onDone(err) {
      if (err) return goNext(err);
      if (++results === middlewares.length) {
        goNext();
      }
    }

    function goNext(err) {
      if (goneNext) return;
      goneNext = true;
      clearTimeout(timeout);
      next(err);
    }
  };
};
