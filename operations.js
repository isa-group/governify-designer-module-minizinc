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
            const docker = exec('docker run --rm -t -v "' + __dirname + '/' + folderName + '":/home -w /home isagroup/minizinc bash -c "mzn2fzn ' + fileName + '.mzn && fzn-gecode ' + fileName + '.fzn"', (error, stdout, stderr) => {
                if (error) {
                    var e = {};
                    e.type = "Error";
                    e.message = error;
                    res.send(e);
                    console.error(e);
                }
                res.send(new responseModel('OK', "<pre>" + stdout + "</pre>", data, null));
                console.log("CSP response:\n", stdout);
                console.log("Minizinc execution has finished");
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
            case 'json':
                if (syntaxDes != 'yaml') {

                    translateCombinationError(res, syntaxDes);

                } else {

                    var dataObject = JSON.parse(data.content);
                    res.json(new responseModel('OK', 'The content has been translated', yaml.safeDump(dataObject), []));

                }
                break;
            case 'yaml':
                if (syntaxDes != 'json') {

                    translateCombinationError(res, syntaxDes);

                } else {

                    var dataObject = yaml.safeLoad(data.content);
                    res.json(new responseModel('OK', 'The content has been translated', JSON.stringify(dataObject, null, 2), []));

                }
                break;
            default:
                res.json(new responseModel('ERROR', "It is not possible to translate from " + syntaxSrc + " to " + syntaxDes, null, []));
        }

    },
    update: function (res, data, aux2) {

        if (data.length == 2) {

            var agreement = yaml.safeLoad(data[0].content);
            var contractId = agreement.id;

            var reloadConfig = yaml.safeLoad(data[1].content);

            var registryEndpoint = agreement.context.infrastructure.registry;
            var reporterEndpoint = agreement.context.infrastructure.reporter;

            request({
                url: registryEndpoint + '/api/v1/agreements/' + contractId,
                method: 'DELETE'
            }, (err, response, body) => {
                if (err) {
                    console.error(err);
                }

                request({
                    url: registryEndpoint + '/api/v1/agreements/',
                    method: 'POST',
                    json: agreement
                }, (err, response, body) => {
                    if (err) {
                        console.error(err);
                    }

                    if (reloadConfig) {
                        var reloadUrl = registryEndpoint + "/api/v1/states/" + contractId + "/reload";
                        console.log("Entering in reload invocation: " + reloadUrl);
                        if (!reloadUrl) {
                            console.error("Bad reload parameters");
                        } else {
                            request({
                                url: reloadUrl,
                                method: "POST",
                                json: reloadConfig
                            }, function (error, currentResponse, body) {
                                if (error) {
                                    console.error("Reload error: " + error);
                                } else if (currentResponse) {
                                    console.log("Reload response: " + currentResponse.statusCode);
                                    if (currentResponse.statusCode !== 200) {
                                        console.error("Problems with reload (" + currentResponse.statusCode + ")");
                                    } else {

                                        setTimeout(function () {
                                            res.json(new responseModel('OK', "The contract has been updated:" +
                                                "<ul>" +
                                                "<li>Download KPI status: <a href='" + reporterEndpoint + "/api/v2/contracts/" + contractId + "/kpis' target='_blank'>CSV</a> " +
                                                "<a href='" + reporterEndpoint + "/api/v2/contracts/" + contractId + "/kpis?format=json' target='_blank'>JSON</a></li>" +
                                                "<li>Download services status: <a href='" + reporterEndpoint + "/api/v2/contracts/" + contractId + "/services' target='_blank'>CSV</a> " +
                                                "<a href='" + reporterEndpoint + "/api/v2/contracts/" + contractId + "/services?format=json' target='_blank'>JSON</a></li>" +
                                                "</ul>"), null, []);
                                        }, 15000);


                                    }
                                }
                            });
                        }
                    }

                });
            });

        } else {
            console.error('There was an error while retrieving the agreement')
            res.json(new responseModel('ERROR', "There was an error while retrieving the agreement"));
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