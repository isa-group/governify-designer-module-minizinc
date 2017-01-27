'use strict';

exports.apiV1ModelsModelIdTestsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  **/
  
  
  var examples = {};
  examples['application/json'] = [ {
  "description" : "aeiou",
  "id" : "aeiou",
  "operationMethod" : "aeiou",
  "operationURI" : "aeiou",
  "parameters" : "aeiou",
  "results" : [ {
    "data" : "aeiou",
    "annotations" : [ {
      "severity" : "aeiou",
      "line" : "",
      "column" : "",
      "message" : "aeiou"
    } ],
    "message" : "aeiou",
    "status" : "aeiou"
  } ]
} ];
  
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
  
}

exports.apiV1ModelsModelIdTestsTestIdGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * testId (String)
  **/
  
  
  var examples = {};
  examples['application/json'] = {
  "description" : "aeiou",
  "id" : "aeiou",
  "operationMethod" : "aeiou",
  "operationURI" : "aeiou",
  "parameters" : "aeiou",
  "results" : [ {
    "data" : "aeiou",
    "annotations" : [ {
      "severity" : "aeiou",
      "line" : "",
      "column" : "",
      "message" : "aeiou"
    } ],
    "message" : "aeiou",
    "status" : "aeiou"
  } ]
};
  
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
  
}

exports.apiV1ModelsModelIdTestsTestIdPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * modelId (String)
  * testId (String)
  **/
  
  
  var examples = {};
  examples['application/json'] = {
  "data" : "aeiou",
  "annotations" : [ {
    "severity" : "aeiou",
    "line" : "",
    "column" : "",
    "message" : "aeiou"
  } ],
  "message" : "aeiou",
  "status" : "aeiou"
};
  
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
  
}

