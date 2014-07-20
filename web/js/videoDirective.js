(function() {

    var videoApp = angular.module('videoApp');
    var videoPlayer;

    videojs.options.flash.swf = "/js/video-js.swf";

    videoApp
        .service('videoControls', [
            'timeLineUtils',
            VideoControlsService
        ])
        .directive('vVideo', [
            VideoDirective
        ]);


    function VideoControlsService(timeLineUtils) {
        this.timeLineUtils = timeLineUtils;
    }

    VideoControlsService.prototype.getCurrentTime = function() {
        var currentSeconds = 0;
        if(videoPlayer) {
            currentSeconds = Math.floor(videoPlayer.currentTime());
        }
        return this.timeLineUtils.secondsToTimeLine(currentSeconds);
    };

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

                videoPlayer = this;

                scope.$watch('projectId', function(projectId) {
                    if(projectId) {
                        videoPlayer.src([
                            { type: "video/mp4", src: "/api/video/" + projectId }
                        ]);
                    }
                });
            });
        }
    }

}());
