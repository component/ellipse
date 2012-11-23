/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("ellipse/index.js", function(module, exports, require){

/**
 * Math constants
 */

var pi = Math.PI;
var zero = 0;
var rotation = 2 * pi;
var sexaToRad = 2 * pi / 360;

/**
 * Generates an array of the coordinate points into
 * the given area within an elliptic curve
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Number} n points number
 * @param {Objec} opts options(optional)
 * @return {Array} coordinate points
 * @api public
 */

module.exports = function (width, height, n, opts){
  // options
  var opts = opts || {};
  opts = {
    ini: opts.ini ? opts.ini * sexaToRad : zero,
    end: opts.end ? opts.end * sexaToRad : rotation,
    times: opts.times || 100,
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

});
