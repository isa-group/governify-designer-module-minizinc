ace.define("ace/theme/json",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-json";
exports.cssText = ".ace-json .ace_gutter {\
background: #ebebeb;\
color: #333;\
overflow : hidden;\
}\
.ace-json .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-json {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-json .ace_cursor {\
color: black;\
}\
.ace-json .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-json .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-json .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-json .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-json .ace_invalid {\
background-color: rgb(153, 0, 0);\
color: white;\
}\
.ace-json .ace_fold {\
}\
.ace-json .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-json .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-json .ace_support.ace_type,\
.ace-json .ace_support.ace_class\
.ace-json .ace_support.ace_other {\
color: rgb(109, 121, 222);\
}\
.ace-json .ace_variable.ace_parameter {\
font-style:italic;\
color:#FD971F;\
}\
.ace-json .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-json .ace_comment {\
color: #236e24;\
}\
.ace-json .ace_comment.ace_doc {\
color: #236e24;\
}\
.ace-json .ace_comment.ace_doc.ace_tag {\
color: #236e24;\
}\
.ace-json .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-json .ace_variable {\
color: rgb(49, 132, 149);\
}\
.ace-json .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-json .ace_entity.ace_name.ace_function {\
color: #0000A2;\
}\
.ace-json .ace_heading {\
color: rgb(12, 7, 255);\
}\
.ace-json .ace_list {\
color:rgb(185, 6, 144);\
}\
.ace-json .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-json .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-json .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-json .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-json .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.07);\
}\
.ace-json .ace_gutter-active-line {\
background-color : #dcdcdc;\
}\
.ace-json .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-json .ace_storage,\
.ace-json .ace_keyword,\
.ace-json .ace_meta.ace_tag {\
color: rgb(147, 15, 128);\
}\
.ace-json .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-json .ace_string {\
color: #1A1AA6;\
}\
.ace-json .ace_entity.ace_other.ace_attribute-name {\
color: #994409;\
}\
.ace-json .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
