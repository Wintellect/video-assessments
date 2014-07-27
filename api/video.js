
module.exports.initializer = function(app) {

    var fs = require('fs');
    var projectIdRegex = /^[0-9a-z_-]+$/i;

    app.get("/api/video/:id", function(req, res) {
        var projectId = req.param("id");
        var fileName, fileStat, fileRange, match;
        var totalRange, rangeStart, rangeEnd, rangeSize;
        var readStream;
        if(!projectId.match(projectIdRegex)) {
            sendError(res, 400, 'Invalid project id.');
        }
        else {
            fileName = buildProjectFileName(projectId, ".mp4");
            if (!fs.existsSync(fileName)) {
                sendError(res, 400, 'Project not found.');
            }
            else {

                fileStat = fs.statSync(fileName);
                totalRange = fileStat.size;

                match = (req.headers.range || "").match(/^bytes=(\d+)-(\d+)?$/i);
                if(match) {
                    rangeStart = parseInt(match[1], 10);
                    rangeEnd = match[2] ? parseInt(match[2], 10) : totalRange - 1;
                    rangeSize = rangeEnd - rangeStart + 1;
                    res.writeHead(206, {
                        'Content-Range': 'bytes ' + rangeStart + '-' + rangeEnd + '/' + totalRange,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': rangeSize,
                        'Content-Type': 'video/mp4'
                    });
                    readStream = fs.createReadStream(fileName, {
                        start: rangeStart,
                        end: rangeEnd
                    });
                }
                else {
                    res.writeHead(200, {
                        'Content-Length': totalRange,
                        'Content-Type': 'video/mp4'
                    });
                    readStream = fs.createReadStream(fileName);
                }
                readStream.pipe(res);
            }
        }
    });

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
