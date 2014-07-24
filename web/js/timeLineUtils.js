(function() {

    var videoApp = angular.module('videoApp');

    videoApp.service('timeLineUtils', [
        TimeLineUtils
    ]);

    function TimeLineUtils() {
    }

    TimeLineUtils.prototype.secondsToTimeLine = function(n) {
        var values = [], v;
        if(_.isNumber(n)) {
            values.unshift(twoDigit(n % 60));
            values.unshift(twoDigit(Math.floor(n / 60) % 60));
            v = Math.floor(n / (60 * 60));
            values.unshift(v);
            return values.join(':');
        }
        return "00:00:00";
    };

    TimeLineUtils.prototype.timeLineToSeconds = function(v) {
        var timePos = v || '00:00:00';
        var values = _.map(timePos.split(':'), function(s) {
            var x = parseInt(s);
            return _.isNaN(x) ? 0 : x;
        }).reverse();
        var totalSeconds = 0, multiplier = 1, idx;
        for(idx=0; idx<3 && idx<values.length; idx += 1) {
            totalSeconds += values[idx] * multiplier;
            multiplier *= 60;
        }
        return totalSeconds;
    };

    TimeLineUtils.prototype.importTimeLineData = function(project, fileText) {
        var _this = this;
        var data = d3.csv.parseRows(fileText);
        var questions;
        if(data.length > 3) {
            project.title = data[0][2] || "Title";
            project.questions = _.chain(data)
                .rest(3)
                .map(function(d) {
                    var seconds = _this.timeLineToSeconds(d[10]);
                    return {
                        points: parseInt(d[0]) || 1,
                        concept: d[1],
                        question: d[2],
                        correctAnswer: d[4],
                        answers: _.chain(d)
                            .rest(5)
                            .take(5)
                            .filter(function(t) {
                                return t && t.trim();
                            })
                            .value(),
                        timeLine: _this.secondsToTimeLine(seconds),
                        seconds: seconds
                    };
                })
                .sortBy(function(d) {
                    return d.seconds;
                })
                .value();
        }
    };

    function twoDigit(n) {
        return _.isNumber(n) ? (n < 10 ? "0" + n : n.toString()) : "00";
    }

}());
