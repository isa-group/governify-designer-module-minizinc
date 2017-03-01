'use strict'

const yaml = require('js-yaml');
const request = require('request');
const fs = require('fs');
const path = require('path');
const cspFolder = 'csp_files';

module.exports = {
    execute: function (res, data) {
        console.log('Starting Minizinc execution...');

        const mznObject = yaml.safeLoad(data[0].content);
        const mznDocument = MinizincStatementBuilder.minizincDocument(mznObject);
        // Specify minizinc file name
        const date = new Date();
        const random = Math.round(Math.random() * 1000);

        const goals = (mznObject.goals && mznObject.goals.length > 0) ? mznObject.goals : ['satisfy'];

        var promisesCreateFiles = [];
        goals.forEach(function (goal, index) {
            promisesCreateFiles.push(new Promise(function (resolve, reject) {

                // Concatenate solve to the document
                var mznDocumentToSolve = mznDocument + "\nsolve " + goal + ";";

                // Create MiniZinc files
                var fileName = 'problem_' + date.getTime() + '_' + index + '_' + random;
                fs.writeFile(cspFolder + "/" + fileName + ".mzn", mznDocumentToSolve, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            goal: goal,
                            fileName: fileName
                        });
                    }
                });
            }));
        });

        Promise.all(promisesCreateFiles).then(function (goalObjs) {

            // Get MiniZinc bash command
            let bashCmd = getMiniZincCmd(goalObjs);

            // MiniZinc execution
            require('child_process').exec(bashCmd, (error, stdout, stderr) => {
                if (error) {
                    let e = {
                        type: "Error",
                        message: error
                    };
                    res.send(e);
                    console.error(e);
                } else {
                    res.send(new responseModel('OK', "<pre>" + stdout + "</pre>", data, null));
                    console.log(stdout);
                }
                console.log("Minizinc execution has finished");
            });
        }, function (err) {
            let e = {
                type: "Error",
                message: err
            };
            res.send(e);
            console.error(e);
            console.log("Minizinc execution has finished");
        });

    },
    executeDocument: function (res, data) {
        console.log('Starting Minizinc execution...');

        var mznDocument = data[0].content;
        var promises = _createMinizincFiles(mznDocument);
        _executeMinizincPromises(promises, (error, stdout, stderr) => {
            if (error) {
                let e = {
                    type: "Error",
                    message: error
                };
                res.send(e);
                console.error(e);
            } else {
                res.send(new responseModel('OK', "<pre>" + stdout + "</pre>", data, null));
                console.log(stdout);
            }
            console.log("Minizinc execution has finished");
        }, (err) => {
            let e = {
                type: "Error",
                message: err
            };
            res.send(e);
            console.error(e);
            console.log("Minizinc execution has finished");
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
    checkConsistency: function (syntax, res, data) {
        switch (syntax) {
            case 'mzn':
                var mznDocument = data.content;
                var promises = _createMinizincFiles(mznDocument);
                _executeMinizincPromises(promises, (error, stdout, stderr) => {

                    if (error || stderr) { // isConsistent
                        var re = /.*\.mzn:([0-9]+):.*/;
                        var annotations = [];
                        var errorMsgs = stderr.split(/\r?\n\r?\n/);

                        stderr.split(/\r?\n\r?\n/).forEach((errorMsg, index) => {
                            var group = re.exec(errorMsg);
                            if (group && group.length === 2) {
                                let line = parseInt(group[1]) - 1;
                                annotations.push(new annotation('error', line, 0, errorMsg.trim()));
                            }
                        });

                        if (annotations.length > 0) {
                            res.json(new responseModel('OK_PROBLEMS', null, null, annotations));
                        } else {
                            res.json(new responseModel('OK_PROBLEMS', null, null, [new annotation('error', 0, 0, stderr ? stderr: (typeof error === "object" && error.message)? error.message: "")]));
                        }

                    } else {
                        res.json(new responseModel('OK', null, null, null));
                    }
                }, (err) => {
                    res.json(new responseModel('OK_PROBLEMS', null, null, [new annotation('error', 0, 0, err)]));
                });
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

        if (typeof mznObject === "object") {
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
            // Goals
            if (mznObject.goals) {
                mznData += MinizincStatementBuilder.goals(mznObject.goals);
            }
        }

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
     * Returns a "goals" statement Minizinc statement from a constraint object.
     */
    static goals(mznGoalsObject) {
        return "% goals: '" + mznGoalsObject.join(", ") + "'\n";
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
    static minizincObject(mznDocument) {
        var mznObject = {};
        var isEnum = false;
        var enumStatements = "";
        mznDocument.split('\n').forEach(function (line) {

            line = line.trim();

            if (line.startsWith('var ') && !isEnum) {
                MinizincObjectBuilder.var(line, mznObject);
            } else if (line.startsWith('constraint ') && !isEnum) {
                MinizincObjectBuilder.constraint(line, mznObject);
            } else if ((line.startsWith('float') || line.startsWith('int') || line.startsWith('bool')) && !isEnum) {
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
            } else if (line.startsWith('% goals:')) {
                MinizincObjectBuilder.goals(line, mznObject);
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

    /**
     * Builds a goals object from Minizinc statement considering the declaration:
     * % goals: 'satisfy', 'minimize'
     */
    static goals(statement, mznObject) {

        // Extracts information from statement with regexp
        var group = /^% goals:\s*[\'\"](.+)[\'\"]/.exec(statement);
        var goals = [];
        group[1].split(",").forEach(function (goal) {
            goals.push(goal.trim());
        });

        // Modifies object
        mznObject.goals = goals;

        return mznObject;

    }
}

/**
 * Get MiniZinc command based on 'goalObjs' array
 */
var getMiniZincCmd = function (goalObjs, options) {
    var bashCmd = "";

    goalObjs.forEach(function (goalObj) {
        if (bashCmd !== "") bashCmd += " && ";

        var echoTitle = 'echo \'' + goalObj.goal + ':\'';
        if (options && typeof options === "object" && "addEchoGoal" in options && options["addEchoGoal"] === false)
            echoTitle = '';

        let mzn2fznCmd = 'mzn2fzn ' + cspFolder + "/" + goalObj.fileName + '.mzn';
        let fznGecodeCmd = 'fzn-gecode ' + cspFolder + "/" + goalObj.fileName + '.fzn';
        let oznCmd = 'solns2out --search-complete-msg \'\' ' + cspFolder + "/" + goalObj.fileName + '.ozn';

        let grepFilterBlankLines = 'grep -v \'^$\'';

        if (echoTitle !== '') {
            bashCmd += echoTitle + ' && ' + mzn2fznCmd + ' && ' + fznGecodeCmd + ' | ' + oznCmd + ' | ' + grepFilterBlankLines;
        } else {
            bashCmd += mzn2fznCmd + ' && ' + fznGecodeCmd + ' | ' + oznCmd + ' | ' + grepFilterBlankLines;
        }
    });

    return bashCmd;
};

var _createMinizincFiles = (mznDocument) => {
    // Specify minizinc file name
    const date = new Date();
    const random = Math.round(Math.random() * 1000);

    var promisesCreateFiles = [];
    promisesCreateFiles.push(new Promise(function (resolve, reject) {

        // Create MiniZinc files
        var fileName = 'problem_' + date.getTime() + '_' + random;
        fs.writeFile(cspFolder + "/" + fileName + ".mzn", mznDocument, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    fileName: fileName
                });
            }
        });
    }));
    return promisesCreateFiles;
};

var _executeMinizincPromises = (promises, callback1, callback2) => {

    // Remove file
    let removeFileFromPromise = (promises) => {
        promises.forEach((promise) => {
            fs.unlink(cspFolder + "/" + promise.fileName + ".mzn", () => {
                fs.unlink(cspFolder + "/" + promise.fileName + ".fzn", () => {
                    fs.unlink(cspFolder + "/" + promise.fileName + ".ozn", () => {
                        return true;
                    });
                });
            });
        });
    };

    Promise.all(promises).then(function (goalObjs) {

        // Get MiniZinc bash command
        let bashCmd = getMiniZincCmd(goalObjs, {
            "addEchoGoal": false
        });

        // MiniZinc execution
        require('child_process').exec(bashCmd, callback1);

        setTimeout(() => {
            removeFileFromPromise(goalObjs);
        }, 5000);

    }, callback2);
};