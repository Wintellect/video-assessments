(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('projectCtrl', [
        '$stateParams',
        '$state',
        'projectsService',
        'timeLineUtils',
        ProjectController
    ]);

    function ProjectController($stateParams, $state, projectsService, timeLineUtils) {
        var ctrl = this;
        ctrl.$state = $state;
        ctrl.projectsService = projectsService;
        ctrl.timeLineUtils = timeLineUtils;
        ctrl.projectId = $stateParams.id;
        ctrl.project = {};
        ctrl.answers = [];
        ctrl.loadProject();
    }

    ProjectController.prototype.loadProject = function() {
        var ctrl = this;
        ctrl.projectsService
            .getProject(ctrl.projectId)
            .then(
                function(result) {
                    ctrl.projectsService.currentProject = ctrl.project = result.data;
                });
    };

    ProjectController.prototype.saveProject = function() {
        var ctrl = this;
        ctrl.projectsService
            .saveProject(ctrl.projectId, ctrl.project);
    };

    ProjectController.prototype.importDataFile = function(fileText, fileInfo) {
        var ctrl = this;
        ctrl.timeLineUtils.importTimeLineData(ctrl.project, fileText);
        ctrl.$state.go('project.questions');
    };

    ProjectController.prototype.goToQuestion = function(q) {
        var ctrl = this;
        ctrl.projectsService.currentQuestion = q;
        ctrl.$state.go('project.question');
    };

    ProjectController.prototype.addNewQuestion = function(q) {
        var ctrl = this;
        ctrl.projectsService.currentQuestion = {
            points: 1,
            concept: "Concept",
            question: "Question",
            correctAnswer: "A",
            answers: [
                "Answer"
            ],
            timeLine: ctrl.timeLineUtils.secondsToTimeLine(0),
            seconds: 0
        };
        ctrl.$state.go('project.question');
    };

    ProjectController.prototype.showAnswers = function(q) {
        var ctrl = this;
        var letterIdx = 0;
        if(q && q.answers) {
            ctrl.answers = _.map(q.answers, function(a) {
                var key = String.fromCharCode(65 + letterIdx);
                letterIdx += 1;
                return {
                    key: key,
                    text: a,
                    isCorrectAnswer: q.correctAnswer === key ? "\u2713" : ""
                }
            });
        }
        else {
            ctrl.answers = [];
        }
    };

}());
