(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('exportCtrl', [
        '$state',
        'timeLineUtils',
        'projectsService',
        '$window',
        ExportController
    ]);

    function ExportController($state, timeLineUtils, projectsService, $window) {
        var ctrl = this;
        ctrl.$state = $state;
        ctrl.timeLineUtils = timeLineUtils;
        ctrl.projectsService = projectsService;
        ctrl.$window = $window;
        ctrl.messages = ctrl.projectsService.validateCurrentProject();
    }

    ExportController.prototype.downloadFile = function() {
        var ctrl = this;
        var project = ctrl.projectsService.currentProject;
        ctrl.projectsService
            .saveProject(project.id, project)
            .then(function() {
                var url = URI.expand("/api/projects/{projectId}/download", {
                    projectId: project.id
                });
                ctrl.$window.location.href = url;
            });
    };

}());
