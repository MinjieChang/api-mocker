"use strict";

var path = require('path');

var glob = require('glob');

var fs = require('fs');

var chalk = require('chalk');

var error = chalk.bold.red;
var rootDir = process.cwd();

var isFileExist = function isFileExist(filePath) {
  return fs.existsSync(filePath);
};

var getFileExt = function getFileExt(filePath) {
  return path.extname(filePath);
};

var getBaseName = function getBaseName(filePath) {
  var ext = getFileExt(filePath);
  return path.basename(filePath, ext);
};

var load = function load(path) {
  if (require.resolve(path)) {
    delete require.cache[require.resolve(path)];
    return require(path);
  }
};

var getFileMap = function getFileMap(mockPath) {
  var mockPaths = path.join(path.resolve(mockPath), '**/*');
  var fileMap = {};
  var files = glob.sync(mockPaths);
  files.forEach(function (mockFile) {
    var stats = fs.statSync(mockFile);

    if (stats.isFile()) {
      fileMap[getBaseName(mockFile)] = mockFile;
    }
  });
  return fileMap;
};

var mockServer = function mockServer(app, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$watch = _options.watch,
      watch = _options$watch === void 0 ? '/api/*' : _options$watch,
      api = _options.api;
  var mockPath = path.resolve(rootDir, 'mock');
  var apiPath = path.resolve(rootDir, api);
  var fileMap = getFileMap(mockPath);

  if (!isFileExist(mockPath)) {
    console.log('');
    console.log(error('error: mock folder is required'));
    process.exit(0);
  }

  app.all(watch, function (req, res) {
    var url = req.path;
    var mockUrl = getMockUrlMap(apiPath)[url];
    var mockFileName = getBaseName(mockUrl); // 新增mock文件

    if (!fileMap[mockFileName]) {
      fileMap = getFileMap(mockPath);
    }

    if (getFileExt(fileMap[mockFileName]) === '.json') {
      res.json(load(fileMap[mockFileName]));
    } else {
      load(fileMap[mockFileName])(req, res);
    }
  });
};

var getMockUrlMap = function getMockUrlMap(apiPath) {
  var api = load(apiPath);
  return Object.keys(api).reduce(function (prev, next) {
    var urlPath = api[next];
    prev[urlPath] = path.resolve(rootDir, './mock/', next);
    return prev;
  }, {});
};

module.exports = mockServer;