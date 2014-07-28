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

    angular.extend(VideoControlsService.prototype, {

        getCurrentSeconds: function() {
            var currentSeconds = 0;
            if(videoPlayer) {
                currentSeconds = Math.floor(videoPlayer.currentTime());
            }
            return currentSeconds;
        },

        getCurrentTime: function() {
            return this.timeLineUtils.secondsToTimeLine(this.getCurrentSeconds());
        },

        pauseVideo: function() {
            if(videoPlayer) {
                videoPlayer.pause();
            }
        },

        playVideo: function() {
            if(videoPlayer) {
                videoPlayer.play();
            }
        }

    });

    function VideoDirective() {

        return {
            restrict: 'A',
            scope: {
                projectId: '@',
                onCurrentPositionChanged: '&'
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {
            videojs(element[0], {}, function() {

                videoPlayer = this;

                videoPlayer.on('timeupdate', function() {
                    scope.onCurrentPositionChanged();
                });

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
