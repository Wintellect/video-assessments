(function() {

    var videoApp = angular.module('videoApp');

    videoApp.service('assessmentUtils', [
        'timeLineUtils',
        AssessmentUtils
    ]);

    function AssessmentUtils(timeLineUtils) {
        var self = this;
        self.timeLineUtils = timeLineUtils;
        self.project = {};
        self.assessmentPoints = [];
    }

    angular.extend(AssessmentUtils.prototype, {

        initialize: function(project) {
            var self = this;
            self.project = project;
            self.assessmentPoints = _
                .chain(self.project.questions)
                .map(function(q) {
                    var nq = angular.copy(q);
                    nq.seconds = self.timeLineUtils.timeLineToSeconds(q.timeLine);
                    nq.questionAsked = false;
                    nq.answers = _.map(nq.answers, function(a, letterIdx) {
                        return {
                            key: String.fromCharCode(65 + letterIdx),
                            text: a
                        };
                    });
                    return nq;
                })
                .filter(function(q) {
                    return q.seconds > 0;
                })
                .sortBy(function(q) {
                    return q.seconds;
                })
                .value();
            self.tally = {
                totalQuestions: self.assessmentPoints.length,
                numberSkipped: 0,
                numberCorrect: 0,
                numberAnswered: 0,
                percentComplete: "0%"
            };
        },

        getCurrentAssessmentQuestion: function(seconds) {
            var self = this;
            var q;
            if(seconds > 0) {
                q = _.find(self.assessmentPoints, function(p) {
                    return seconds >= p.seconds && !p.questionAsked;
                });
            }
            return q;
        },

        getNextAssessmentQuestion: function() {
            var self = this;
            var q = _.find(self.assessmentPoints, function(p) {
                return !p.questionAsked;
            });
            return q;
        },

        checkAnswer: function(question, answer) {
            var self = this;
            var isCorrect = false;
            self.tally.numberAnswered += 1;
            question.questionAsked = true;
            if(angular.isUndefined(answer) || answer == null) {
                self.tally.numberSkipped += 1;
            }
            else {
                if(answer === question.correctAnswer) {
                    isCorrect = true;
                    self.tally.numberCorrect += 1;
                }
            }
            if(self.tally.totalQuestions > 0) {
                self.tally.percentComplete =
                    Math.floor(self.tally.numberAnswered / self.tally.totalQuestions * 100.0) + '%';
            }
            else {
                self.tally.percentComplete = "0%";
            }
            return isCorrect;
        },

        tally: {
            totalQuestions: 0,
            numberSkipped: 0,
            numberCorrect: 0,
            numberAnswered: 0,
            percentComplete: "0%"
        }

    });

}());
