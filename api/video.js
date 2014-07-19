
module.exports.initializer = function(app) {

    var _ = require('lodash');
    var fs = require('fs');
    var busboy = require('connect-busboy');

    var projectIdRegex = /^[0-9a-z_-]+$/i;

    app.use(busboy());

    app.put("/api/video/:id", function(req, res) {
        var projectId = req.param("id");
        var fileName, fileStream;
        if(!projectId.match(projectIdRegex)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {
            fileName = buildProjectFileName(projectId, ".json");
            if (!fs.existsSync(fileName)) {
                sendError(res, 400, 'Project not found.');
            }
            else {
                fileName = buildProjectFileName(projectId, ".mp4");
                req.busboy.on('file', function(fieldname, file, filename) {
                    fileStream = fs.createWriteStream(fileName, {
                        flags: 'w+',
                        encoding: null,
                        mode: 0666
                    });
                    fileStream.on('close', function () {
                        console.log('Uploaded ' + filename);
                        res.json({
                            id: projectId
                        });
                    });
                    file.pipe(fileStream);
                });
                req.pipe(req.busboy);
            }
        }
    });

    function buildProjectFileName(projectId, extension) {
        return [
            "data/",
            projectId,
            extension
        ].join("");
    }

    function sendError(res, errCode, errorText) {
        res.send(errCode, {
            error: errorText
        });
    }
};
