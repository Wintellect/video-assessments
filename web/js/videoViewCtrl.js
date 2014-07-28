(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('videoViewCtrl', [
        '$stateParams',
        '$state',
        '$q',
        'projectsService',
        'assessmentUtils',
        'videoControls',
        VideoViewController
    ]);

    function VideoViewController($stateParams, $state, $q, projectsService, assessmentUtils, videoControls) {
        this.$state = $state;
        this.$q = $q;
        this.projectsService = projectsService;
        this.projectId = $stateParams.id;
        this.assessmentUtils = assessmentUtils;
        this.videoControls = videoControls;
        this.modalControls = {};
        this.selectedAnswer = null;
        this.buttonText = "Check Your Answer";
        this.isCorrectAnswer = this.isIncorrectAnswer = false;
        this.loadProject();
    }

    angular.extend(VideoViewController.prototype, {

        loadProject: function() {
            var self = this;
            self.projectsService
                .getProject(self.projectId)
                .then(
                    function(result) {
                        self.project = result.data;
                        self.assessmentUtils.initialize(self.project);
                        self.tally = self.assessmentUtils.tally;
                    });
        },

        onVideoPositionChanged: function() {
            var self = this;
            self.checkForNextAssessmentQuestion()
                .then(function() {
                    self.videoControls.pauseVideo();
                    self.modalControls.openModal();
                });
        },

        skipQuestion: function() {
            var self = this;
            self.assessmentUtils.checkAnswer(self.question, null);
            self.checkForNextAssessmentQuestion().then(
                function() {
                },
                function() {
                    self.modalControls.closeModal();
                    self.videoControls.playVideo();
                });
        },

        checkAnswer: function() {
            var self = this;
            if(!self.question.questionAsked) {
                var isCorrect = self.assessmentUtils.checkAnswer(self.question, self.selectedAnswer);
                self.isCorrectAnswer = isCorrect;
                self.isIncorrectAnswer = !isCorrect;
                self.buttonText = "Close";
            }
            else {
                self.buttonText = "Check Your Answer";
                self.checkForNextAssessmentQuestion().then(
                    function() {
                    },
                    function() {
                        self.modalControls.closeModal();
                        self.videoControls.playVideo();
                    });
            }
        },

        checkForNextAssessmentQuestion: function() {
            var self = this;
            var df = self.$q.defer();
            self.selectedAnswer = null;
            self.isCorrectAnswer = self.isIncorrectAnswer = false;
            self.question = self.assessmentUtils.getCurrentAssessmentQuestion();
            if(self.question) {
                df.resolve();
            }
            else {
                df.reject();
            }
            return df.promise;
        }
    });

}());
