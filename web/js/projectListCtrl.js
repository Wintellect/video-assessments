(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('projectListCtrl', [
        'projectsService',
        ProjectListController
    ]);

    function ProjectListController(projectsService) {
        var ctrl = this;
        ctrl.projectId = '';
        ctrl.projectList = [];
        ctrl.projectsService = projectsService;
        ctrl.loadProjectList();
    }

    ProjectListController.prototype.loadProjectList = function() {
        var ctrl = this;
        ctrl.projectsService
            .getProjects()
            .then(
                function(result) {
                    ctrl.projectList = result.data.projects;
                });
    };

    ProjectListController.prototype.createNewProject = function() {
        var ctrl = this;
        ctrl.createError = '';
        ctrl.projectsService
            .createNewProject(ctrl.projectId)
            .then(
                function() {
                    ctrl.projectId = '';
                    ctrl.loadProjectList();
                },
                function(result) {
                    ctrl.createError = result.data.error;
                });
    };

}());
