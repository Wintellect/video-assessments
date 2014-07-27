(function() {

    var videoApp = angular.module('videoApp');

    videoApp.controller('videoViewCtrl', [
        '$stateParams',
        '$state',
        'projectsService',
        VideoViewController
    ]);

    function VideoViewController($stateParams, $state, projectsService) {
        var ctrl = this;
        ctrl.$state = $state;
        ctrl.projectsService = projectsService;
        ctrl.projectId = $stateParams.id;
        ctrl.loadProject();
    }

    angular.extend(VideoViewController.prototype, {

        loadProject: function() {
            var ctrl = this;
            ctrl.projectsService
                .getProject(ctrl.projectId)
                .then(
                    function(result) {
                        ctrl.project = result.data;
                    });
        }
    });

}());
