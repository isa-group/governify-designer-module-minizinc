'use strict';

var manifest = require('./loadManifest.js').load('api/manifest.yaml');
var moduleInfo = require('./loadManifest.js').load('package.json');

exports.apiV2ModelsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/

  if(manifest) {
    res.json(manifest.models);
  }
  else {
    res.status(500)
    res.end('Something fails. It has not been imposible to load manifest.yaml');
  }
  
  
}

exports.apiV2ModelsModelIdGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  **/

  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          res.json(manifest.models[m]);   
        }
      }
      res.status(404);
      res.end('Model with id='+ model + ' does not exist.')
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }
  }
  else {
    res.status(400)
    res.end('{modelId} parameter is required');
  }
  
  
}

exports.manifestGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/
  
  if(manifest) {
    res.json(manifest);
  }
  else {
    res.status(500)
    res.end('Something fails. It has not been imposible to load manifest.yaml');
  }
  
  
}

exports.apiV2GET = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/
  
  if(manifest) {
    res.json(manifest);
  }
  else {
    res.status(500)
    res.end('Something fails. It has not been imposible to load manifest.yaml');
  }
  
  
}

exports.versionGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/

  if(manifest) {
    res.json(moduleInfo.version);
  }
  else {
    res.status(500)
    res.end('Something fails. It has not been imposible to load manifest.yaml');
  }
  
  
}

