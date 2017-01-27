'use strict'

var jsyaml = require('js-yaml');
var fs = require('fs');

exports.load = function (file) {
	var manifest_file = fs.readFileSync(file, 'utf8');
	var manifest = jsyaml.safeLoad(manifest_file);
	return manifest;
}