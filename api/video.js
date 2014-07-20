
module.exports.initializer = function(app) {

    var _ = require('lodash');
    var fs = require('fs');
    var busboy = require('connect-busboy');

    var projectIdRegex = /^[0-9a-z_-]+$/i;

    app.use(busboy());

    app.get("/api/video/:id", function(req, res) {
        var projectId = req.param("id");
        var fileName, fileStat, fileRange, match;
        var totalRange, rangeStart, rangeEnd, rangeSize;
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

                console.log([
                    "Requested Range:", req.headers.range
                ].join(" "));
                match = (req.headers.range || "").match(/^bytes=(\d+)-(\d+)?$/i);
                if(match) {
                    rangeStart = parseInt(match[1], 10);
                    rangeEnd = match[2] ? parseInt(match[2], 10) : totalRange - 1;
                    rangeSize = rangeEnd - rangeStart + 1;
                    console.log([
                        'Video', projectId,
                        'Size:', totalRange,
                        'Range:', rangeStart, "-", rangeEnd
                    ].join(" "));
                    res.writeHead(206, {
                        'Content-Range': 'bytes ' + rangeStart + '-' + rangeEnd + '/' + totalRange,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': rangeSize,
                        'Content-Type': 'video/mp4'
                    });
                    fs.createReadStream(fileName, {
                        start: rangeStart,
                        end: rangeEnd
                    }).pipe(res);
                }
                else {
                    console.log([
                        'Video', projectId,
                        'Size:', totalRange,
                        'Range: ALL'
                    ].join(" "));
                    res.writeHead(200, {
                        'Content-Length': fileStat.size,
                        'Content-Type': 'video/mp4'
                    });
                    fs.createReadStream(fileName).pipe(res);
                }
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
