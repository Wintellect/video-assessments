(function() {

    var videoApp = angular.module('videoApp');
    var maxAnswerCount = 5;

    videoApp.controller('questionCtrl', [
        '$state',
        'timeLineUtils',
        'projectsService',
        QuestionController
    ]);

    function QuestionController($state, timeLineUtils, projectsService) {
        var ctrl = this;
        var q = projectsService.currentQuestion;
        ctrl.$state = $state;
        ctrl.timeLineUtils = timeLineUtils;
        ctrl.projectsService = projectsService;
        ctrl.question = {
            text: q.question,
            concept: q.concept,
            timeLine: q.timeLine,
            correctAnswer: q.correctAnswer,
            answers: _.map(q.answers, function(a, letterIdx) {
                    var key = String.fromCharCode(65 + letterIdx);
                    return {
                        key: key,
                        text: a,
                        isCorrectAnswer: q.correctAnswer === key
                    }
                })
        };
        ctrl.canAddAnswers = ctrl.question.answers.length < maxAnswerCount;
        ctrl.isNewQuestion = projectsService.isNewQuestion(q);
    }

    QuestionController.prototype.saveQuestion = function(projectId) {
        var ctrl = this;
        var q = ctrl.question;
        var updatedQuestion = {
            question: q.text,
            concept: q.concept,
            timeLine: q.timeLine,
            correctAnswer: q.correctAnswer,
            answers: _.map(q.answers, function(a) {
                return a.text;
            })
        };
        ctrl.projectsService.updateCurrentQuestion(updatedQuestion);
        ctrl.$state.go('project.questions', {id: projectId});
    };

    QuestionController.prototype.addAnswer = function(projectId) {
        var ctrl = this;
        var answerCount = ctrl.question.answers.length;
        if(ctrl.canAddAnswers) {
            ctrl.question.answers.push({
                key: String.fromCharCode(65 + answerCount),
                text: "Answer",
                isCorrectAnswer: answerCount === 0
            });
        }
        ctrl.canAddAnswers = ctrl.question.answers.length < maxAnswerCount;
    };

    QuestionController.prototype.deleteAnswer = function(answer) {
        var ctrl = this;
        var q = ctrl.question;
        ctrl.question.answers = _
            .chain(ctrl.question.answers)
            .filter(function(a){
                return a !== answer;
            })
            .map(function(a, letterIdx) {
                var key = String.fromCharCode(65 + letterIdx);
                a.key = key;
                a.isCorrectAnswer = q.correctAnswer === key;
                return a;
            })
            .value();
        if(!_.some(ctrl.question.answers, function(a) { return a.isCorrectAnswer; }) &&
            ctrl.question.answers.length > 0) {
            ctrl.question.answers[0].isCorrectAnswer = true;
            q.correctAnswer = ctrl.question.answers[0].key;
        }
        ctrl.canAddAnswers = ctrl.question.answers.length < maxAnswerCount;
    };

    QuestionController.prototype.canDropAnswer = function(item, data) {
        var ctrl = this;
        if(!_.some(ctrl.question.answers, function(a) { return a === item; })) {
            return false;
        }
        return data.key !== item.key;
    };

    QuestionController.prototype.onDropAnswer = function(item, data) {
        var ctrl = this;
        var q = ctrl.question;
        var updated = [];
        _.each(ctrl.question.answers, function(a) {
            if(a.key === item.key) {
                if(data.key < item.key) {
                    updated.push(a);
                    updated.push(data);
                }
                else {
                    updated.push(data);
                    updated.push(a);
                }
            }
            else if(a.key !== data.key) {
                updated.push(a);
            }
        });
        ctrl.question.answers = _.map(updated, function(a, letterIdx) {
                var key = String.fromCharCode(65 + letterIdx);
                a.key = key;
                if(a.isCorrectAnswer) {
                    q.correctAnswer = a.key;
                }
                return a;
            });
    };

    QuestionController.prototype.deleteQuestion = function(projectId) {
        var ctrl = this;
        ctrl.projectsService.deleteCurrentQuestion(ctrl.question);
        ctrl.$state.go('project.questions', {id: projectId});
    };

}());
