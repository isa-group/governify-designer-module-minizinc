'use strict';

var url = require('url');


var Test = require('./TestService');


module.exports.apiV1ModelsModelIdTestsGET = function apiV1ModelsModelIdTestsGET (req, res, next) {
  Test.apiV1ModelsModelIdTestsGET(req.swagger.params, res, next);
};

module.exports.apiV1ModelsModelIdTestsTestIdGET = function apiV1ModelsModelIdTestsTestIdGET (req, res, next) {
  Test.apiV1ModelsModelIdTestsTestIdGET(req.swagger.params, res, next);
};

module.exports.apiV1ModelsModelIdTestsTestIdPOST = function apiV1ModelsModelIdTestsTestIdPOST (req, res, next) {
  Test.apiV1ModelsModelIdTestsTestIdPOST(req.swagger.params, res, next);
};
