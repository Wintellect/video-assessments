
module.exports.initializer = function(app) {

    var _ = require('lodash');
    var fs = require('fs');
    var async = require('async');
    var stringify = require('csv-stringify');

    var projectIdRegex = /^[0-9a-z_-]+$/i;

    app.get("/api/projects", function(req, res) {
        async.waterfall([
                function(callback) {
                    fs.readdir('data', callback);
                },
                function(files, callback) {
                    var jsonFiles = _.filter(files, function(fn) {
                        return fn.match(/\.json$/i);
                    });
                    async.map(jsonFiles, function(file, callback) {
                            var fileName = "data/" + file;
                            async.waterfall([
                                    function(callback) {
                                        fs.readFile(fileName, callback);
                                    },
                                    function(fileContents, callback) {
                                        var data = JSON.parse(fileContents);
                                        var project = {
                                            id: data.id,
                                            title: data.title,
                                            created: data.created,
                                            modified: data.modified
                                        };
                                        callback(null, project);
                                    }
                                ],
                                callback);
                        },
                        callback);
                }
            ],
            function(err, result) {
                if(err) {
                    sendError(res, 500, 'Error retrieving projects.');
                }
                else {
                    res.json({
                        projects: result
                    });
                }
            });
    });

    app.get("/api/projects/:id", function(req, res) {

        var projectId = req.param("id");
        var fileName, project;

        if(!projectId.match(projectIdRegex)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {

            fileName = buildProjectFileName(projectId);
            if(!fs.existsSync(fileName)) {
                sendError(res, 404, 'Project not found.');
            }
            else {

                project = JSON.parse(fs.readFileSync(fileName));
                res.json(project);
            }
        }
    });

    app.get("/api/projects/:id/download", function(req, res) {

        var projectId = req.param("id");
        var fileName, project;
        var csv, outputData = '';

        if(!projectId.match(projectIdRegex)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {

            fileName = buildProjectFileName(projectId);
            if(!fs.existsSync(fileName)) {
                sendError(res, 404, 'Project not found.');
            }
            else {

                project = JSON.parse(fs.readFileSync(fileName));

                csv = stringify({
                    headers: 3,
                    rowDelimiter: 'windows'
                });
                csv.on('readable', function() {
                    while(row = csv.read()){
                        outputData += row;
                    }
                });
                csv.on('finish', function() {
                    res.type("text/csv");
                    res.attachment(projectId + ".csv");
                    res.send(outputData);
                });
                csv.write([
                    '',
                    'Name of the Video (exact same as on the web site):',
                    project.title,
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ]);
                csv.write([
                    '',
                    'Instructions:',
                    'Please select the most appropriate option for each of the multiple choice questions.',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ]);
                csv.write([
                    'Marks / Points',
                    'Concepts to be tested',
                    'Question',
                    'No. of Options',
                    'Answer Key',
                    'Option 1',
                    'Option 2',
                    'Option 3',
                    'Option 4',
                    'Option 5',
                    'H:MM:SS - Timestamp for MCQ popup'
                ]);
                _.each(project.questions, function(q) {
                    var columns = [];
                    columns.push(1);
                    columns.push(q.concept);
                    columns.push(q.question);
                    columns.push(q.answers.length);
                    columns.push(q.correctAnswer);
                    _.times(5, function(i) {
                        columns.push(i < q.answers.length ? q.answers[i] : '');
                    });
                    columns.push(q.timeLine);
                    csv.write(columns);
                });
                csv.end();
            }
        }
    });

    app.post("/api/projects", function(req, res) {
        var projectId = (req.body || {}).projectId;
        var fileName;
        if(!projectId.match(projectIdRegex)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {
            fileName = buildProjectFileName(projectId);
            if(fs.existsSync(fileName)) {
                sendError(res, 409, 'Project Id already exists.');
            }
            else {
                fs.writeFileSync(
                    fileName,
                    JSON.stringify({
                            id: projectId,
                            title: projectId + ' Title',
                            created: new Date(),
                            modified: new Date(),
                            videoLength: "1:00:00"
                        },
                        null,
                        '  '));
                res.send(200);
            }
        }
    });

    app.put("/api/projects/:id", function(req, res) {

        var projectId = req.param("id");
        var project = (req.body || {}).project;
        var fileName, original;
        if(!projectId.match(projectIdRegex) || (projectId !== project.id)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {
            fileName = buildProjectFileName(projectId);
            if(!fs.existsSync(fileName)) {
                sendError(res, 400, 'Project not found.');
            }
            else {
                original = JSON.parse(fs.readFileSync(fileName));
                project.created = original.created;
                project.modified = new Date();
                fs.writeFileSync(fileName, JSON.stringify(project, null, '  '));
                res.json({
                    id: projectId,
                    modified: project.modified
                });
            }
        }
    });

    function buildProjectFileName(projectId) {
        return [
            "data/",
            projectId,
            ".json"
        ].join("");
    }

    function sendError(res, errCode, errorText) {
        res.send(errCode, {
            error: errorText
        });
    }
};
