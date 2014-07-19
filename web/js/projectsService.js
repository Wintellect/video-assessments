(function() {

    var videoApp = angular.module('videoApp');

    videoApp.service('projectsService', [
        '$http',
        '$q',
        'timeLineUtils',
        ProjectsService
    ]);

    function ProjectsService($http, $q, timeLineUtils) {
        var service = this;
        service.$http = $http;
        service.$q = $q;
        service.timeLineUtils = timeLineUtils;
        service.currentProject = undefined;
        service.currentQuestion = undefined;
    }

    ProjectsService.prototype.getProjects = function() {
        return this.$http({
            method: 'GET',
            url: '/api/projects'
        });
    };

    ProjectsService.prototype.createNewProject = function(projectId) {
        return this.$http({
            method: 'POST',
            url: '/api/projects',
            data: {
                projectId: projectId
            }
        });
    };

    ProjectsService.prototype.getProject = function(projectId) {
        var url = URI.expand("/api/projects/{projectId}", {
            projectId: projectId
        });
        return this.$http({
            method: 'GET',
            url: url
        });
    };

    ProjectsService.prototype.saveProject = function(projectId, project) {
        var deferred = this.$q.defer();
        var url = URI.expand("/api/projects/{projectId}", {
            projectId: projectId
        });
        this.$http({
            method: 'PUT',
            url: url,
            data: {
                project: project
            }
        }).then(
            function(result) {
                project.modified = result.data.modified;
                deferred.resolve(result);
            },
            function(result) {
                deferred.reject(result);
            }
        );
        return deferred.promise;
    };

    ProjectsService.prototype.updateCurrentQuestion = function(question) {
        var service = this;
        var seconds, didTimeLineChange;
        if(service.currentQuestion) {

            seconds = service.timeLineUtils.timeLineToSeconds(question.timeLine);
            question.timeLine = service.timeLineUtils.secondsToTimeLine(seconds);
            didTimeLineChange = seconds !== service.currentQuestion.seconds;
            service.currentQuestion.question = question.question;
            service.currentQuestion.concept = question.concept;
            service.currentQuestion.correctAnswer = question.correctAnswer;
            service.currentQuestion.answers = question.answers;
            service.currentQuestion.timeLine = question.timeLine;
            service.currentQuestion.seconds = seconds;

            if(service.isNewQuestion(service.currentQuestion)) {
                didTimeLineChange = true;
                service.currentProject.questions = service.currentProject.questions || [];
                service.currentProject.questions.push(service.currentQuestion);
            }

            if(didTimeLineChange && service.currentProject) {
                service.currentProject.questions =
                    _.sortBy(service.currentProject.questions, function(d) {
                        return d.seconds;
                    });
            }
        }
    };

    ProjectsService.prototype.isNewQuestion = function(question) {
        var service = this;
        return !_.some(service.currentProject.questions, function(q) {
            return q === service.currentQuestion;
        });
    };

    ProjectsService.prototype.deleteCurrentQuestion = function(question) {
        var service = this;
        service.currentProject.questions = _.remove(
            service.currentProject.questions, function(q) {
                return q !== service.currentQuestion;
            });
        service.currentQuestion = undefined;
    };

    ProjectsService.prototype.validateCurrentProject = function() {
        var service = this;
        var messages = [];
        angular.extend(messages, {
            addMsg: function(msg, subList) {
                this.push({ text: msg, subList: subList });
            },
            addErr: function(msg) {
                this.push({ isErr: true, text: msg });
                return true;
            }
        });
        _.some(service.validations, function(v) {
            return v(messages, service.currentProject, service);
        });
        return messages;
    };

    ProjectsService.prototype.validations = [

        // Project information is present
        function(messages, prj) {
            if (!prj) {
                return messages.addErr("Project information not found.");
            }
        },

        // Project questions are present
        function(messages, prj) {
            if(!prj.questions || !prj.questions.length) {
                return messages.addErr("No questions are available in the project.");
            }
        },

        // Project title
        function(messages, prj) {
            if(!prj.title) {
                messages.addErr("Project title not specified.");
            }
        },

        // Concepts
        function(messages, prj) {
            if(_.some(prj.questions, function(q) {
                return !q.concept;
            })) {
                messages.addErr("Concept must be specified on all questions.");
            }
        },

        // Question text
        function(messages, prj) {
            if(_.some(prj.questions, function(q) {
                return !q.question;
            })) {
                messages.addErr("Question text must be specified.");
            }
        },

        // At least two answers
        function(messages, prj) {
            if(_.some(prj.questions, function(q) {
                return !q.answers || q.answers.length < 2;
            })) {
                messages.addErr("Each question needs at least two choices.");
            }
        },

        // Answer text
        function(messages, prj) {
            if(_.some(prj.questions, function(q) {
                return _.some(q.answers, function(a) {
                    return !a;
                })
            })) {
                messages.addErr("Answer text must be specified.");
            }
        },

        // Correct answer
        function(messages, prj) {
            var keyList = ['A', 'B', 'C', 'D', 'E'];
            if(_.some(prj.questions, function(q) {
                var idx = _.indexOf(keyList, q.correctAnswer, true);
                return idx === -1 || idx >= q.answers.length;
            })) {
                messages.addErr("Questions must be assigned the correct answer.");
            }
        },

        // Time line values
        function(messages, prj, service) {
            if(_.some(prj.questions, function(q) {
                var v = q.timeLine || "";
                var secs = service.timeLineUtils.timeLineToSeconds(v);
                var maxSeconds = 60 * 60 * 3; // Maximum 3 hours
                return !v.match(/^(\d{1,2}:)?\d{1,2}:\d{2}$/) || secs === 0 || secs > maxSeconds;
            })) {
                messages.addErr("Invalid time line values found.");
            }
        },

        // Total number of questions
        function(messages, prj) {
            messages.addMsg("Total questions: " + prj.questions.length);
        },

        // Total length
        function(messages, prj) {
            var min = _.min(prj.questions, function(q) { return q.seconds; });
            var max = _.max(prj.questions, function(q) { return q.seconds; });
            messages.addMsg([
                "Questions span from",
                min.timeLine,
                "to",
                max.timeLine
            ].join(" "));
        },

        // Average time between questions
        function(messages, prj, service) {
            var v = 0;
            var timeBetween = _.chain(prj.questions)
                .map(function(q) {
                    return q.seconds;
                })
                .uniq(true)
                .map(function(s) {
                    var rtn = s - v;
                    v = s;
                    return rtn;
                })
                .reduce(function(t, s) {
                    t.sum += s;
                    t.count += 1;
                    return t;
                }, {
                    sum: 0,
                    count: 0
                })
                .value();
            timeBetween.avg =
                service.timeLineUtils.secondsToTimeLine(
                    Math.floor(timeBetween.sum / timeBetween.count)
                );
            messages.addMsg("Average time between questions: " + timeBetween.avg);
        },

        // Distinct concepts and counts
        function(messages, prj) {
            var groups = _.chain(prj.questions)
                .groupBy(function(q) {
                    return (q.concept ? q.concept : "").toLowerCase();
                })
                .map(function(v, k) {
                    return {
                        key: k,
                        concept: v[0].concept,
                        count: v.length
                    };
                })
                .sortBy('key')
                .map(function(v) {
                    return v.count + " - " + v.concept;
                })
                .value();
            messages.addMsg(groups.length + " concept(s) found.", groups);
        }
    ];

}());
