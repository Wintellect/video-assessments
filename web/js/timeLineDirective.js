(function() {

    var videoApp = angular.module('videoApp');

    videoApp.directive('vTimeLine', [
        'timeLineUtils',
        TimeLineDirective
    ]);

    function TimeLineDirective(timeLineUtils) {
        return {
            restrict: 'E',
            template: '<svg width="100%" height="100%"></svg>',
            replace: true,
            scope: {
                videoLength: '=',
                questions: '='
            },
            link: directiveLink
        };

        function directiveLink(scope, element, attrs) {

            var videoLength = "";
            var points = [];

            scope.$watch('videoLength', function(v){
                videoLength = v;
                renderTimeLine(videoLength, points, element);
            });
            scope.$watch(
                function(scope) {
                    var v = scope.questions
                        ? _.chain(scope.questions)
                        .map(function(q,i) {
                            return [ i, q.seconds ].join('/');
                        })
                        .join('|')
                        .value()
                        : "";
                    return v;
                },
                function(newValue, oldValue, scope){
                    var list = scope.questions;
                    if(list && list.length > 0) {
                        points = _
                            .chain(list)
                            .map(function(q) {
                                return q.seconds;
                            })
                            .uniq(true)
                            .value();
                    }
                    else {
                        points = [];
                    }
                    renderTimeLine(videoLength, points, element);
                }
            );
        }

        function parseVideoLength(v) {
            var videoLen = v || '1:00:00';
            var totalSeconds = timeLineUtils.timeLineToSeconds(videoLen);
            if(totalSeconds < 30 * 60) {
                totalSeconds = 30 * 60;
            }
            return totalSeconds;
        }

        function renderTimeLine(videoLength, points, element) {

            var dm = {
                width: 1000,
                height: 100,
                margin: 40,
                barHeight: 10
            };

            var totalSeconds = parseVideoLength(videoLength);
            element.empty();

            var svg = d3.select(element[0]);
            svg
                .attr('viewBox', [
                    0, 0, dm.width, dm.height
                ].join(' '))
                .attr('preserveAspectRatio', 'none');

            var timeScale = d3.scale.linear()
                .domain([0, totalSeconds])
                .range([dm.margin, dm.width - dm.margin]);

            var tickValues = [];
            var tick = 0;
            var tickOffs =
                (totalSeconds > 60 * 60 * 1.5)
                    ? 15 * 60
                    : (totalSeconds > 60 * 60)
                    ? 10 * 60
                    : 5 * 60;
            while(tick <= totalSeconds) {
                tickValues.push(tick);
                tick += tickOffs;
            }

            var timeAxis = d3.svg.axis()
                .scale(timeScale)
                .orient("bottom")
                .tickValues(tickValues)
                .tickFormat(timeLineUtils.secondsToTimeLine);

            svg
                .append("g")
                .attr("transform", [
                    'translate(',
                    0,
                    ',',
                        dm.height / 2,
                    ')'
                ].join(""))
                .call(timeAxis);

            var pv = svg
                .append("g");

            pv
                .selectAll("path")
                .data(points)
                .enter()
                .append("path")
                .attr("d", function(d) {
                    var x = timeScale(d);
                    return [
                        "M", x, 50,
                        "L", x + 12, 10,
                        "L", x - 12, 10,
                        "L", x, 50
                    ].join(" ");
                })
                .attr("fill", "green")
                .attr("stroke", "black")
                .attr("stroke-width", "1");
        }
    }

}());
