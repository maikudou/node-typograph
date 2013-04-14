'use strict';
var path = require('path');

module.exports = ArgChecker;

function ArgChecker(conf) {
  conf = conf || {};
  this.expect = conf.expect || {};
  this.name = conf.name || process.argv[0] + ' ' + path.basename(process.argv[1]);
  this.exit = conf.exit || 1;
  this.usage = conf.usage || this.createUsage();
}

ArgChecker.check = function(conf) {
  var ac;
  try {
    ac = new ArgChecker(conf);
    return ac.check(process.argv.slice(2));
  } catch (e) {
    if (e.message) exit(ac.exit, e.message + '\n' + ac.usage);
    exit(0, ac.usage);
  }
};

ArgChecker.prototype.check = function(args) {
  var tmpVals = [];
  var cur = null;
  args.concat(['-']).forEach(function(arg) {
    if (arg[0] === '-') {
      if (cur && cur.param) {
        throw new Error('Missing param: ' + cur.param);
      }
      if (arg == '-') {
        cur = null;
        return;
      }
      if (arg == '-h' && !this.expect['-h']) throw new Error('');
      cur = this.expect[arg];
      if (!cur) {
        throw new Error('Invalid option: ' + arg);
      } else if (!cur.repeat && cur.data) {
        throw new Error('Duplicated option: ' + arg);
      }
      if (!cur.data) cur.data = [];
    } else {
      if (cur && cur.param) {
        cur.data.push(arg);
        cur = null;
      } else {
        tmpVals.push(arg);
      }
    }
  }, this);

  var valExps = [];
  var mustValExps = [];
  Object.keys(this.expect).forEach(function(key) {
    if (key[0] === '-') return;
    valExps.push(key);
    if (this.expect[key].must) mustValExps.push(key);
  }, this);

  var tmpValIndex = 0;
  var valExpIndex = 0;
  var mustValExpIndex = 0;
  Object.keys(this.expect).forEach(function(key) {
    if (key[0] === '-' || !tmpVals.length) return;
    var exp = this.expect[key];
    if (!exp.must && tmpVals.length <= mustValExps.length - mustValExpIndex) {
      valExpIndex = valExps.length - (mustValExps.length - mustValExpIndex);
      return;
    }
    exp.data = [];
    if (exp.repeat) {
      while (tmpVals.length) {
        exp.data.push(tmpVals.shift());
        if (tmpVals.length < valExps.length - valExpIndex) break;
      }
    } else {
      exp.data.push(tmpVals.shift());
    }
    valExpIndex++;
    if (exp.must) mustValExpIndex++;
  }, this);

  // too many args
  if (tmpVals.length) throw new Error('Too many arguments.');

  // set default value
  Object.keys(this.expect).forEach(function(key) {
    var exp = this.expect[key];
    if (!exp.data && 'default' in exp) exp.data = [exp.default];
  }, this);

  // must check
  Object.keys(this.expect).forEach(function(key) {
    var exp = this.expect[key];
    if (exp.must && !exp.data) throw new Error('Missing required arguments.');
  }, this);

  return this;
};

ArgChecker.prototype.get = function(name) {
  var exp = this.expect[name];
  if (!exp || !exp.data) return undefined;
  if (exp.repeat) return exp.data;
  return (!exp.data) ? undefined : exp.data[0];
};

ArgChecker.prototype.isOn = function(name) {
  return !!(this.expect[name] && this.expect[name].data);
};

ArgChecker.prototype.isOff = function(name) {
  return !this.isOn(name);
};

ArgChecker.prototype.createUsage = function() {
  var strs = ['Usage: ' + this.name];
  Object.keys(this.expect).forEach(function(key) {
    var exp = this.expect[key];
    var tmp = key;
    if (exp.param) tmp += ' ' + exp.param;
    strs.push(!exp.must ? '[' + tmp + ']' : tmp);
    if (exp.repeat) strs.push('...');
  }, this);
  return strs.join(' ');
}

function exit(code, mes) {
  if (mes) code ? console.error(mes) : console.log(mes);
  process.exit(code);
}