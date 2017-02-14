'use strict'

const yaml = require('js-yaml');
const request = require('request');
const fs = require('fs');
const path = require('path');

module.exports = {
    executeMinizinc: function (res, data) {
        // Specify Filename
        const date = new Date();
        const random = Math.round(Math.random() * 1000);
        const fileName = 'problem_' + date.getTime() + '_' + random;
        const folderName = 'csp_files';
        // Write on file
        fs.writeFile(folderName + "/" + fileName + ".mzn", data[0].content, function (err) {
            if (err) {
                var e = {};
                e.type = "Error";
                e.message = err;
                res.send(e);
                console.error(e);
            }
            const exec = require('child_process').exec;
            exec('docker run --rm -t -v "' + __dirname + '/' + folderName + '":/home -w /home isagroup/minizinc bash -c "mzn2fzn ' + fileName + '.mzn && fzn-gecode ' + fileName + '.fzn | solns2out ' + fileName + '.ozn"', (error, stdout, stderr) => {
                if (error) {
                    var e = {};
                    e.type = "Error";
                    e.message = error;
                    res.send(e);
                    console.error(e);
                } else {
                    res.send(new responseModel('OK', "<pre>" + stdout + "</pre>", data, null));
                    console.log("CSP response:\n", stdout);
                    console.log("Minizinc execution has finished");
                }
            });
        });
    },
    check: function (syntax, res, data) {
        switch (syntax) {
            case 'yaml':
                try {
                    yaml.safeLoad(data.content, 'utf8');
                    res.json(new responseModel('OK', null, null, null));
                } catch (e) {
                    var annotations = [new annotation('error', e.mark.line, e.mark.column, e.reason)];
                    res.json(new responseModel('OK_PROBLEMS', null, null, annotations));
                }
                break;
        }
    },
    translate: function (syntaxSrc, syntaxDes, res, data) {

        switch (syntaxSrc) {
            case 'mzn':
                if (syntaxDes === 'yaml') {

                    res.json(new responseModel('OK', 'The content has been translated',
                        yaml.safeDump(MinizincObjectBuilder.minizincObject(data.content)), []));

                } else if (syntaxDes === 'json') {

                    res.json(new responseModel('OK', 'The content has been translated',
                        JSON.stringify(MinizincObjectBuilder.minizincObject(data.content), null, 4), []));

                } else {

                    translateCombinationError(res, syntaxDes);

                }
                break;
            case 'json':
                if (syntaxDes === 'yaml') {

                    var mznObject = JSON.parse(data.content);
                    res.json(new responseModel('OK', 'The content has been translated', yaml.safeDump(mznObject), []));

                } else if (syntaxDes === 'mzn') {

                    var mznObject = JSON.parse(data.content);
                    res.json(new responseModel('OK', 'The content has been translated', MinizincStatementBuilder.minizincDocument(mznObject), []));

                } else {

                    translateCombinationError(res, syntaxDes);

                }
                break;
            case 'yaml':
                if (syntaxDes === 'mzn') {

                    var mznObject = yaml.safeLoad(data.content, 'utf8');
                    res.json(new responseModel('OK', 'The content has been translated',
                        MinizincStatementBuilder.minizincDocument(mznObject), []));

                } else if (syntaxDes === 'json') {

                    var mznObject = yaml.safeLoad(data.content);
                    res.json(new responseModel('OK', 'The content has been translated', JSON.stringify(mznObject, null, 4), []));

                } else {

                    translateCombinationError(res, syntaxDes);

                }
                break;
            default:
                res.json(new responseModel('ERROR', "It is not possible to translate from " + syntaxSrc + " to " + syntaxDes, null, []));
        }

    }
}

function translateCombinationError(res, syntaxDes) {
    res.json(new responseModel("ERROR", "It is not possible to translate from yaml to " + syntaxDes, null, []));
}

function responseModel(status, message, data, annotations) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.annotations = annotations;
}

function annotation(type, row, column, text) {
    this.type = type;
    this.row = row;
    this.column = column;
    this.text = text;
}

class MinizincStatementBuilder {

    /**
     * Build a Minizinc document from a javascript object.
     */
    static minizincDocument(mznObject) {
        var mznData = "";

        // Parameters
        if (mznObject.parameters) {
            mznObject.parameters.forEach(function (parameter) {
                mznData += MinizincStatementBuilder.parameter(parameter);
            });
        }
        // Variables
        if (mznObject.variables) {
            mznObject.variables.forEach(function (variable) {
                mznData += MinizincStatementBuilder.var(variable);
            });
        }
        // Constraints
        if (mznObject.constraints) {
            mznObject.constraints.forEach(function (constraint) {
                mznData += MinizincStatementBuilder.constraint(constraint);
            });
        }

        mznData += "\nsolve satisfy;"

        return mznData;
    }

    /**
     * Returns a "var" Minizinc statement from a variable object.
     */
    static
    var (mznVariableObject) {
        var typeOrRange = "";

        if ("range" in mznVariableObject) {
            typeOrRange += mznVariableObject.range.min + ".." + mznVariableObject.range.max
        } else {
            typeOrRange += mznVariableObject.type;
        }

        return "var " + typeOrRange + ": " + mznVariableObject.id + ";\n";
    }

    /**
     * Returns a "constraint" statement Minizinc statement from a constraint object.
     */
    static parameter(mznParameterObject) {
        var ret = "";
        if (mznParameterObject.type === "enum") {
            ret += "set of int: " + mznParameterObject.id + "_domain = 1.." + mznParameterObject.values.length + "; % enum block start\n";
            var i = 1;
            mznParameterObject.values.forEach(function (value) {
                ret += "int: " + value + " = " + i + ";\n";
                i++;
            });
            ret += "var " + mznParameterObject.id + "_domain: " + mznParameterObject.id + "; % enum block end\n";
        } else {
            ret += mznParameterObject.type + ": " + mznParameterObject.id + " = " + mznParameterObject.value + ";\n";
        }
        return ret;
    }

    /**
     * Returns a "constraint" statement Minizinc statement from a constraint object.
     */
    static constraint(mznConstraintObject) {
        return "constraint " + mznConstraintObject.expression + "; % " + mznConstraintObject.id + "\n";
    }

    /**
     * Returns a "commentary" Minizinc statement from a string.
     */
    static commentary(c) {
        return "% " + c + ";\n";
    }


    /**
     * Returns a "commentary".
     */
    static solve() {
        return "solve satisfy;\n";
    }
}

class MinizincObjectBuilder {

    /**
     * Build Minizinc object from a string document.
     */
    static minizincObject (mznDocument) {
        var mznObject = {};
        var isEnum = false;  var enumStatements = "";
        mznDocument.split('\n').forEach(function (line) {

            line = line.trim();

            if (line.startsWith('var ') && !isEnum) {
                MinizincObjectBuilder.var(line, mznObject);
            } else if (line.startsWith('constraint ') && !isEnum) {
                MinizincObjectBuilder.constraint(line, mznObject);
            } else if ((line.startsWith('float') || line.startsWith('int') || line.startsWith('bool')) && !isEnum ) {
                MinizincObjectBuilder.parameter(line, mznObject);
            } else if ((line.startsWith('set') && line.endsWith('% enum block start')) || isEnum) {
                // Check last iteration
                if (line.endsWith("% enum block end")) {
                    enumStatements += line;
                    isEnum = false;
                    MinizincObjectBuilder.enum(enumStatements.split("\n"), mznObject);
                    enumStatements = "";
                } else {
                    isEnum = true;
                    enumStatements += line + "\n";
                }
            }

        });
        return mznObject;
    }

    /**
     * Builds a var object from Minizinc statement considering two types of declaration:
     *  - var 0..10: resolutionHours;
     *  - var int: invoicePenalty;
     */
    static
    var (statement, mznObject) {

        if (!("variables" in mznObject)) mznObject.variables = [];

        // Extracts information from statement with regexp
        var group = /^var\s(.+)\.\.(.+)\s*:\s*(.+)\s*;/.exec(statement); // with range
        var varObj = {};
        if (group && group[1] && group[2] && group[3]) {
            varObj = {
                "id": group[3],
                "range": {
                    "min": group[1],
                    "max": group[2]
                }
            };
        } else {
            group = /^var\s(.+)\s*:\s*(.+)\s*;/.exec(statement); // with type
            varObj = {
                "id": group[2],
                "type": group[1]
            };
        }

        // Modifies object
        mznObject.variables.push(varObj);

        return mznObject;

    }

    /**
     * Builds a parameter object from Minizinc statement
     */
    static parameter(statement, mznObject) {

        if (!("parameters" in mznObject)) mznObject.parameters = [];

        // Extracts information from statement with regexp
        var group = /^(.+)\s*:\s*(.+)\s*=\s*(.+)\s*;/.exec(statement);
        var param = {
            "id": group[2].trim(),
            "type": group[1],
            "value": group[3].trim()
        };

        // Modifies object
        mznObject.parameters.push(param);

        return mznObject;

    }

    /**
     * Builds a enum parameter object from Minizinc statement
     */
    static enum(statements, mznObject) {

        if (!("parameters" in mznObject)) mznObject.parameters = [];

        var param = {
            id: "",
            type: "enum",
            values: []
        };

        // Extracts information from statements with regexp
        statements.forEach(function (statement) {
            if (statement.startsWith("set of int:")) {
                // nothing
            } else if (statement.startsWith("int:")) {
                var enumValue = /^.+:(.*)=.*;$/.exec(statement)[1].trim();
                param.values.push(enumValue);
            } else if (statement.startsWith("var ")) {
                var enumName = /^.+:(.*);.*$/.exec(statement)[1].trim();
                param.id = enumName;
            }
        });

        // Modifies object
        mznObject.parameters.push(param);

        return mznObject;

    }

    /**
     * Builds a constraint object from Minizinc statement considering the declaration:
     * constraint resolutionHours <= 4;
     */
    static constraint(statement, mznObject) {

        if (!("constraints" in mznObject)) mznObject.constraints = [];

        // Extracts information from statement with regexp
        var groupWithoutId = /^constraint\s+(.+);$/.exec(statement);
        var constObj = {};
        if (groupWithoutId) {
            //TODO: create id for constraint
            var constNumber = 1;
            mznObject.constraints.forEach(function (constraint) {
                var groupQ = /^Q([0-9]+)$/.exec(constraint.id);
                if (groupQ && constNumber <= parseInt(groupQ[1])) {
                    constNumber = parseInt(groupQ[1]) + 1;
                }
            });
            constObj = {
                "id": "Q" + constNumber,
                "expression": groupWithoutId[1]
            };
        } else {
            var groupWithId = /^constraint\s(.+);\s*\%\s*(.+)\s*/.exec(statement);
            constObj = {
                "id": groupWithId[2],
                "expression": groupWithId[1]
            };
        }

        // Modifies object
        mznObject.constraints.push(constObj);

        return mznObject;

    }
}