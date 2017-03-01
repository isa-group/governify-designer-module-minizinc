'use strict';

var url = require('url');


var service = require('./ConsistencyService');


module.exports.apiV2ModelsModelIdConsistenciesGET = function apiV2ModelsModelIdConsistenciesGET (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdConsistenciesConsistencyIdCheckPOST = function apiV2ModelsModelIdConsistenciesConsistencyIdCheckPOST (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesConsistencyIdCheckPOST(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdConsistenciesConsistencyIdGET = function apiV2ModelsModelIdConsistenciesConsistencyIdGET (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesConsistencyIdGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdConsistenciesConsistencyIdModeGET = function apiV2ModelsModelIdConsistenciesConsistencyIdModeGET (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesConsistencyIdModeGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdConsistenciesConsistencyIdThemeGET = function apiV2ModelsModelIdConsistenciesConsistencyIdThemeGET (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesConsistencyIdThemeGET(req.swagger.params, res, next);
};

module.exports.apiV2ModelsModelIdConsistenciesConsistencyIdTranslatePOST = function apiV2ModelsModelIdConsistenciesConsistencyIdTranslatePOST (req, res, next) {
  service.apiV2ModelsModelIdConsistenciesConsistencyIdTranslatePOST(req.swagger.params, res, next);
};
