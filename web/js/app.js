$(document).foundation();

(function() {

    var videoApp = angular.module('videoApp', [
        'ui.router'
    ]);

    videoApp.config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("/");
            $stateProvider
                .state('projects', {
                    url: "/",
                    templateUrl: "partials/projects.html"
                })
                .state('project', {
                    url: "/:id",
                    abstract: true,
                    templateUrl: "partials/project.html"
                })
                .state('project.questions', {
                    url: "",
                    templateUrl: "partials/questions.html"
                })
                .state('project.import', {
                    templateUrl: "partials/import.html"
                })
                .state('project.video', {
                    templateUrl: "partials/video.html"
                })
                .state('project.export', {
                    templateUrl: "partials/export.html",
                    controller: "exportCtrl as export"
                })
                .state('project.question', {
                    templateUrl: "partials/question.html",
                    controller: "questionCtrl as question"
                })
                .state('view', {
                    templateUrl: "partials/videoView.html",
                    url: "/view/:id",
                    controller: "videoViewCtrl as videoView"
                })
                .state('exam', {
                    templateUrl: "partials/examView.html",
                    url: "/exam/:id",
                    controller: "examViewCtrl as examView"
                });
    }]);

}());
