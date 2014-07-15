(function() {

    var videoApp = angular.module('videoApp');

    videoApp.directive('vFileReader', [
        '$window',
        FileReaderDirective
    ]);

    function FileReaderDirective($window) {

        return {
            restrict: 'A',
            scope: {
                onFileSelected: '&'
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {

            if($window.File && $window.FileReader && $window.FileList && $window.Blob) {
                element.bind('change', function(evt) {

                    var fileInfo, fileReader;
                    if(evt.target.files.length === 1) {
                        fileInfo = evt.target.files[0];
                        fileReader = new $window.FileReader();
                        fileReader.onload = function(evt) {
                            scope.$apply(function() {
                                scope.onFileSelected({
                                    fileText: evt.target.result,
                                    fileInfo: fileInfo
                                });
                            });
                        };
                        fileReader.readAsText(fileInfo);
                    }
                });
            }
            else {
                attrs.$set('disabled', 'disabled');
                alert("The APIs required for reading the file are not supported in this browser.");
            }
        }
    }

}());
