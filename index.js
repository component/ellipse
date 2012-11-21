
/**
 * Generates an array of coordinate points within an ellipse
 *
 * @param {Number} num
 * @return {String}
 * @api public
 */

var pi = Math.PI;
var zero = 0;
var recto = pi/2;
var giro = 2 * pi;

var sexaToRad = 2 * pi / 360;

module.exports = function (width, height, n, el, opts){

  // options
  var opts = opts || {};
  opts = {
    ini: opts.ini ? opts.ini * sexaToRad : zero,
    end: opts.end ? opts.end * sexaToRad : giro,
    times: opts.times || 1000,
  };

  opts.dir = opts.ini > opts.end ? -1 : 1;

  var w = (width - el / 2) / 2;
  var h = (height - el / 2) / 2;
  var points = initialize(w, h, n, opts);

  for (var i = 0; i < opts.times; i++) {
    adjust_angles(points, opts.dir);
    update_carts(points, w, h, opts.dir);
  }

  // x/y offset
  for (var i = 0; i < points.length; i++) {
    points[i].x += w;
    points[i].y += h;
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
 * @param {Number} w
 * @param {Number} h
 * @param {Number} n count of elements
 * @return {Array}
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
