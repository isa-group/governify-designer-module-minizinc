'use strict';

var url = require('url');


var Help = require('./HelpService');


module.exports.helpGET = function helpGET (req, res, next) {
  Help.helpGET(req.swagger.params, res, next);
};
