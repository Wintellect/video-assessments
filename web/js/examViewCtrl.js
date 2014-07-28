(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('examViewCtrl', [
        '$stateParams',
        '$state',
        '$q',
        'projectsService',
        'assessmentUtils',
        ExamViewController
    ]);

    function ExamViewController($stateParams, $state, $q, projectsService, assessmentUtils) {

        var self = this;

        self.$state = $state;
        self.$q = $q;
        self.projectsService = projectsService;
        self.projectId = $stateParams.id;
        self.assessmentUtils = assessmentUtils;
        self.isExamFinished = false;

        self.resetQuestion();
        self.loadProject().then(function() {
            self.handleNextQuestion();
        });
    }

    angular.extend(ExamViewController.prototype, {

        loadProject: function() {
            var self = this;
            var df = self.$q.defer();
            self.projectsService
                .getProject(self.projectId)
                .then(
                    function(result) {
                        self.project = result.data;
                        self.assessmentUtils.initialize(self.project);
                        self.tally = self.assessmentUtils.tally;
                        df.resolve();
                    },
                    function(result) {
                        df.reject();
                    });
            return df.promise;
        },

        handleNextQuestion: function() {
            var self = this;
            self.checkForNextAssessmentQuestion().then(function(nextQuestion) {
                self.resetQuestion(nextQuestion);
            }, function() {
                self.resetQuestion();
                self.isExamFinished = true;
            });
        },

        checkForNextAssessmentQuestion: function() {
            var self = this;
            var df = self.$q.defer();
            var nextQuestion = self.assessmentUtils.getNextAssessmentQuestion();
            if(nextQuestion) {
                df.resolve(nextQuestion);
            }
            else {
                df.reject();
            }
            return df.promise;
        },

        skipQuestion: function() {
            var self = this;
            self.assessmentUtils.checkAnswer(self.question, null);
            self.handleNextQuestion();
        },

        checkAnswer: function() {
            var self = this;
            if(!self.question.questionAsked) {
                var isCorrect = self.assessmentUtils.checkAnswer(self.question, self.selectedAnswer);
                self.isCorrectAnswer = isCorrect;
                self.isIncorrectAnswer = !isCorrect;
                self.buttonText = "Next";
            }
            else {
                self.handleNextQuestion();
            }
        },

        resetQuestion: function(nextQuestion) {
            var self = this;
            self.question = nextQuestion;
            self.selectedAnswer = null;
            self.buttonText = "Check Your Answer";
            self.isCorrectAnswer = self.isIncorrectAnswer = false;
        }

    });

}());
