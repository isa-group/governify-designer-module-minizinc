'use strict';

var url = require('url');


var Manifest = require('./ManifestService');


module.exports.apiV2ModelsGET = function apiV2ModelsGET (req, res, next) {
  Manifest.apiV2ModelsGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdGET = function apiV2ModelsModelIdGET (req, res, next) {
  Manifest.apiV2ModelsModelIdGET(req.swagger.params, res, next);
};

module.exports.manifestGET = function manifestGET (req, res, next) {
  Manifest.manifestGET(req.swagger.params, res, next);
};

module.exports.versionGET = function versionGET (req, res, next) {
  Manifest.versionGET(req.swagger.params, res, next);
};

module.exports.apiV2GET = function apiV2GET (req, res, next) {
  Manifest.apiV2GET(req.swagger.params, res, next);
};
