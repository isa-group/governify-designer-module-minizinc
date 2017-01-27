'use strict';

var url = require('url');


var Operation = require('./OperationService');


module.exports.apiV2ModelsModelIdOperationsGET = function apiV2ModelsModelIdOperationsGET (req, res, next) {
  Operation.apiV2ModelsModelIdOperationsGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdOperationsOperationIdGET = function apiV2ModelsModelIdOperationsOperationIdGET (req, res, next) {
  Operation.apiV2ModelsModelIdOperationsOperationIdGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdOperationsOperationIdPOST = function apiV2ModelsModelIdOperationsOperationIdPOST (req, res, next) {
  Operation.apiV2ModelsModelIdOperationsOperationIdPOST(req.swagger.params, res, next);
};
