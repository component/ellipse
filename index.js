
/**
 * Generates an array of coordinate points within an ellipse
 *
 * @param {Number} num
 * @return {String}
 * @api public
 */

module.exports = function (width, height, n, el){
  var a = (width - el / 2) / 2;
  var b = height - (el / 2);
  var points = initialize(a, b, n);

  for (var i = 0; i < 1000; i++) {
    adjust_angles(points);
    update_carts(points, a, b);
  }

  // build array of all coordinates points [[x0, y0], [x1, y1], ... [xn, yn]]
  for (var i = 0, m = []; i < points.length; i++) {
    var pt = points[i];
    m.push([100 * pt.x, 100 * (pt.y - (el / 4))]);
  }

  return update_top_lefts(m, 4);
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

function adjust_angles(points){
  var max_delta = Math.PI / (24 * points.length);
  var scale = 0.1;

  for (var i = 1; i < points.length - 1; i++) {
    var point = points[i];
    var right = points[i + 1];
    var left = points[i - 1];
    var rdist = dist(right, point);
    var ldist = dist(left, point);
    var nudge = scale * (rdist - ldist);
    var nudge = Math.max(Math.min(nudge, max_delta), -max_delta);
    point.theta += nudge;
  }
}

/**
 * Converts to cartesian coordinates
 */

function update_carts(points, a, b){
  points.map(function(pt){
    pt.x = a * Math.cos(pt.theta);
    pt.y = b * Math.sin(pt.theta);
  });
}

/**
 * Update left/top system
 */

function update_top_lefts(points, width){
  var new_points = [];
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var new_x = Number(p[0]) + (50 * width);
    var new_y = Number(p[1]) * (-1);
    new_points.push([new_x, new_y]);
  }

  return new_points;
}

/**
 * Initialize initial group of points
 *
 * @param {Number} a
 * @param {Number} b
 * @param {Number} n count of elements
 * @return {Array}
 * @api private
 */

function initialize(a, b, n){
  var points = [];
  var delta = Math.PI / (n - 1);

  for (var i = 0; i < n; i++) {
    var point = { 'theta': Math.PI + (i * delta) };
    points.push(point);
  }

  update_carts(points, a, b);
  return points;
}
