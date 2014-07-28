(function() {

    var videoApp = angular.module('videoApp');

    videoApp
        .directive('vRevealModal', [
            RevealModalDirective
        ]);

    function RevealModalDirective() {

        return {
            restrict: 'A',
            scope: {
                modalControls: '='
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {
            scope.modalControls = {
                openModal: function() {
                    element.foundation('reveal', 'open');
                },
                closeModal: function() {
                    element.foundation('reveal', 'close');
                }
            };
        }
    }

}());
