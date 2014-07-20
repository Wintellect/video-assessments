(function() {

    var videoApp = angular.module('videoApp');

    videojs.options.flash.swf = "/js/video-js.swf";

    videoApp.directive('vVideo', [
        VideoDirective
    ]);

    function VideoDirective() {

        return {
            restrict: 'A',
            scope: {
                projectId: '@'
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {
            videojs(element[0], {}, function() {

                var player = this;

                scope.$watch('projectId', function(projectId) {
                    if(projectId) {
                        player.src([
                            { type: "video/mp4", src: "/api/video/" + projectId }
                        ]);
                    }
                });
            });
        }
    }

}());
