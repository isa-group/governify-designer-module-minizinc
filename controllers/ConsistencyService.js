'use strict';

var manifest = require('./loadManifest.js').load('api/manifest.yaml');
var moduleInfo = require('./loadManifest.js').load('package.json');
var operations = require('../operations.js');
var fs = require('fs');

exports.apiV2ModelsModelIdConsistenciesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  **/

  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          res.json(manifest.models[m].syntaxes);   
        }
      }
      res.status(404);
      res.end('Model with id='+ model + ' does not exist.');
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }

  }else {
    res.status(400);
    res.end('{modelId} parameter is required');
  }
  
}

exports.apiV2ModelsModelIdConsistenciesConsistencyIdCheckPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * syntaxId (String)
  * data (Filedata)
  **/
  if(!args.modelId || !args.syntaxId || !args.data) {
    res.status(400)
    res.end('All parameters are required');
  }else {
    var model = null;
    for(var m in manifest.models){
      if(manifest.models[m].id == args.modelId.value){
        model = manifest.models[m];  
      }
    }
    if(model){
      var syntax = null;
      for(var s in model.syntaxes){
        if(model.syntaxes[s].id == args.syntaxId.value){
          syntax = model.syntaxes[s];
        }
      }
      if(syntax){
        operations["checkConsistency"](args.syntaxId.value, res, args.data.value);
      }else{
        res.status(404);
        res.end('Model with id='+ args.modelId.value + ' has not syntax with id=' + args.syntaxId.value);    
      }
    }else{
      res.status(404);
      res.end('Model with id='+ args.modelId.value + ' does not exist.');
    }
  }  
  
}

exports.apiV2ModelsModelIdConsistenciesConsistencyIdGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * syntaxId (String)
  **/
   if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          if(args.syntaxId){
            var syntax = args.syntaxId.value;
            for(var s in manifest.models[m].syntaxes){
              if(manifest.models[m].syntaxes[s].id ==  syntax){
                 res.json(manifest.models[m].syntaxes[s]); 
              }
            }  
            res.status(404);
            res.end('Model with id='+ args.modelId.value + ' has not syntax with id=' + args.syntaxId.value);             
          }else{
            res.status(400)
            res.end('{syntaxId} parameter is required');
          }
        }
      }
      res.status(404);
      res.end('Model with id='+ model + ' does not exist.')
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }

  }else {
    res.status(400)
    res.end('{modelId} parameter is required');
  }
  
  
  
}

exports.apiV2ModelsModelIdConsistenciesConsistencyIdModeGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * syntaxId (String)
  **/
  
  
  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          if(args.syntaxId){
            var syntax = args.syntaxId.value;
            for(var s in manifest.models[m].syntaxes){
              if(manifest.models[m].syntaxes[s].id ==  syntax){
                  res.setHeader('content-type', 'text/plain;chartset=utf-8');
                  res.send(fs.readFileSync('modes/' + syntax + '/' + manifest.models[m].syntaxes[s].editorModeURI));
              }
            }  
            res.status(404);
            res.end('Model with id='+ args.modelId.value + ' has not syntax with id=' + args.syntaxId.value);             
          }else{
            res.status(400)
            res.end('{syntaxId} parameter is required');
          }
        }
      }
      res.status(404);
      res.end('Model with id='+ model + ' does not exist.')
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }

  }else {
    res.status(400)
    res.end('{modelId} parameter is required');
  }
  
  
}

exports.apiV2ModelsModelIdConsistenciesConsistencyIdThemeGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * syntaxId (String)
  **/
  
  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          if(args.syntaxId){
            var syntax = args.syntaxId.value;
            for(var s in manifest.models[m].syntaxes){
              if(manifest.models[m].syntaxes[s].id ==  syntax){
                  res.setHeader('content-type', 'text/plain;chartset=utf-8');
                  res.send(fs.readFileSync('modes/' + syntax + '/' + manifest.models[m].syntaxes[s].editorThemeURI));
              }
            }  
            res.status(404);
            res.end('Model with id='+ args.modelId.value + ' has not syntax with id=' + args.syntaxId.value);             
          }else{
            res.status(400)
            res.end('{syntaxId} parameter is required');
          }
        }
      }
      res.status(404);
      res.end('Model with id='+ model + ' does not exist.')
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }

  }else {
    res.status(400)
    res.end('{modelId} parameter is required');
  }
  
  
}

exports.apiV2ModelsModelIdConsistenciesConsistencyIdTranslatePOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * srcConsistencyId (String)
  * desConsistencyId (String)
  * data (Filedata)
  **/
  
  if(args.modelId) {
    if(manifest){
      var model = null
      for(var m in manifest.models){
        if(manifest.models[m].id == args.modelId.value){
           model = manifest.models[m];
        }
      }
      if( model){
        operations["translate"](args.srcConsistencyId.value, args.desConsistencyId.value, res, args.data.value );
      }else{
        res.status(404);
        res.end('Model with id='+ args.modelId.value + ' does not exist'); 
      }
    }else{
      res.status(500);
      res.end('Something fails. It has not been imposible to load manifest.yaml');
    }

  }else{
    res.status(400)
    res.end('{modelId} parameter is required');
  }

}


function modelHasConsistency (model, syntax){
  var ret = false;
  for(var s in model.syntaxes){
    if(model.syntaxes[s].id == syntax)
      ret=true;
  }
  return ret;
}