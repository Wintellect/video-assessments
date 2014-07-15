(function() {

    var videoApp = angular.module('videoApp');
    var dragDropData = undefined;

    videoApp
        .directive('vDraggable', [
            DraggableDirective
        ])
        .directive('vDroppable', [
            DroppableDirective
        ]);

    function DraggableDirective() {
        return {
            restrict: 'A',
            scope: {
                dragDropData: '='
            },
            link: function (scope, element, attrs) {
                attrs.$set("draggable", true);
                element.bind("dragstart", function(evt) {
                    var dataTransfer = evt.originalEvent.dataTransfer;
                    dataTransfer.effectAllowed = 'move';
                    dataTransfer.setData('text', element.text());
                    attrs.$addClass('drag');
                    dragDropData = scope.dragDropData;
                });
                element.bind("dragend", function(evt) {
                    attrs.$removeClass('drag');
                    dragDropData = undefined;
                });
            }
        };
    }

    function DroppableDirective() {
        return {
            restrict: 'A',
            scope: {
                dragDropItem: '=',
                onDrop: '&',
                canDrop: '&'
            },
            link: function (scope, element, attrs) {
                element.bind("dragover", function(evt) {
                    var canDropData = scope.canDrop({
                        item: scope.dragDropItem,
                        data: dragDropData
                    });
                    if(angular.isUndefined(canDropData)) {
                        canDropData = true;
                    }
                    if(canDropData) {
                        attrs.$addClass('drag-over');
                        evt.preventDefault();
                    }
                });
                element.bind("dragleave", function(evt) {
                    attrs.$removeClass('drag-over');
                });
                element.bind("drop", function(evt) {
                    attrs.$removeClass('drag-over');
                    scope.$apply(function() {
                        scope.onDrop({
                            item: scope.dragDropItem,
                            data: dragDropData
                        });
                    });
                });
            }
        };
    }

}());
