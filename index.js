/**
 * Math constants
 */

var pi = Math.PI;
var zero = 0;
var rotation = 2 * pi;
var sexaToRad = 2 * pi / 360;

/**
 * generates an array of coordinates points through of the area and points
 * number
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Number} n points number
 * @param {Objec} opts options(optional)
 * @api public
 */

module.exports = function (width, height, n, opts){
  // options
  var opts = opts || {};
  opts = {
    ini: opts.ini ? opts.ini * sexaToRad : zero,
    end: opts.end ? opts.end * sexaToRad : rotation,
    times: opts.times || 1000,
    arrangement: opts.arrangment || 'normal',
    w: opts.w || 0,
    h: opts.h || 0,
    round: opts.round || false
  };

  opts.dir = opts.ini > opts.end ? -1 : 1;

  var w = width / 2;
  var h = height / 2;

  if ('inside' == opts.arrangement) {
    w -= opts.w / 2;
    h -= opts.h / 2;
  }

  var points = initialize(w, h, n, opts);

  for (var i = 0; i < opts.times; i++) {
    adjust_angles(points, opts.dir);
    update_carts(points, w, h, opts.dir);
  }

  // x/y offset. round.
  for (var i = 0; i < points.length; i++) {
    points[i].x += w - ('symmetric' == opts.arrangement ? opts.w / 2 : 0);
    points[i].y += h - ('symmetric' == opts.arrangement ? opts.h / 2 : 0);
    if (opts.round) {
      points[i].x = Math[opts.round](points[i].x);
      points[i].y = Math[opts.round](points[i].y);
    }
  }

  return points;
};

/**
 * Measures distance between points
 */

function dist(p1, p2){
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

/**
 * Nudges points to achieve equidistantance
 *
 * @param {Array} points
 * @param {Number} dir direction
 * @api private
 */

function adjust_angles(points, dir){
  var max_delta = pi / (24 * points.length);
  var scale = 0.1;

  for (var i = 1; i < points.length - 1; i++) {
    var point = points[i];
    var right = points[i + 1 * dir];
    var left = points[i - 1 * dir];
    var rdist = dist(right, point);
    var ldist = dist(left, point);
    var nudge = scale * (rdist - ldist);
    var nudge = Math.max(Math.min(nudge, max_delta), -max_delta);
    point.theta += nudge;
  }
}

/**
 * Converts to cartesian coordinates
 *
 * @param {Array} points
 * @param {Number} w width
 * @param {Number} h height
 * @param {Number} dir direction
 * @api private
 */

function update_carts(points, w, h, dir){
  points.map(function(pt){
    pt.x = w * Math.cos(pt.theta);
    pt.y = h * (Math.sin(pt.theta) * (-1));
  });
}

/**
 * Initialize initial group of points
 *
 * @param {Number} w width
 * @param {Number} h height
 * @param {Number} n count
 * @return {Array}
 * @param {Object} opts
 * @api private
 */

function initialize(w, h, n, opts){
  var points = [];
  var delta = (opts.end - opts.ini) / (n - 1);

  for (var i = 0; i < n; i++) {
    points.push({ 'theta': i * delta + opts.ini });
  }

  update_carts(points, w, h, opts.dir);
  return points;
}
