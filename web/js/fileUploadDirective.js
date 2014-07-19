(function() {

    var videoApp = angular.module('videoApp');

    videoApp.directive('vFileUpload', [
        FileUploadDirective
    ]);

    function FileUploadDirective() {

        return {
            restrict: 'A',
            scope: {
                uploadTo: '@',
                onVideoLoaded: '&'
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {
            element.fileupload({
                dataType: 'json',
                url: scope.uploadTo,
                type: 'PUT',
                done: function (e, data) {
                    scope.onVideoLoaded();
                }
            })
        }
    }

}());
