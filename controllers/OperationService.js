'use strict';

var manifest = require('./loadManifest.js').load('api/manifest.yaml');
var moduleInfo = require('./loadManifest.js').load('package.json');
var operations = require('../operations.js');

exports.apiV2ModelsModelIdOperationsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  **/
  
  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          res.json(manifest.models[m].operations);   
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

exports.apiV2ModelsModelIdOperationsOperationIdGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * operationId (String)
  **/

  if(args.modelId) {
    var model = args.modelId.value;
    if(manifest){
      for(var m in manifest.models){
        if(manifest.models[m].id == model){
          if(args.operationId){
            var operation = args.operationId.value;
            for(var o in manifest.models[m].operations){
              if(manifest.models[m].operations[o].id ==  operation){
                 res.json(manifest.models[m].operations[o]); 
              }
            }  
            res.status(404);
            res.end('Model with id='+ model + ' has not operation with id=' + operation);             
          }else{
            res.status(400)
            res.end('{operationId} parameter is required');
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

exports.apiV2ModelsModelIdOperationsOperationIdPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * operationId (String)
  * data (List)
  **/
  
  //IMPLEMENT OPERATIONS

  if(!args.modelId || !args.operationId || !args.data) {
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
      var operation = null;
      for(var o in model.operations){
        if(model.operations[o].id ==  args.operationId.value){
           operation = model.operations[o];
        }
      }  
      if(operation){
        execOperation(operation.id, res, args.data.value);
      }else{
        res.status(404);
        res.end('Model with id='+  args.modelId.value + ' has not operation with id=' + args.operationId.value);
      }
    }else{
      res.status(404);
      res.end('Model with id='+ args.modelId.value + ' does not exist.');
    }
  }
  
  
}

function execOperation(operationId, res, data){

  try{
    operations[operationId](res, data);
  }catch(e){
    res.status(500);
    res.end(e.toString());
  }

}