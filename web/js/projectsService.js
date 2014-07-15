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
        var prj = service.currentProject;
        var v, timeBetween;
        if(prj && prj.questions) {

            v = 0;
            timeBetween = _.chain(prj.questions)
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

            messages.push({
                text: "Total questions: " + prj.questions.length
            });
            messages.push({
                text: "Average time between questions: " + timeBetween.avg
            });
        }
        else {
            messages.push({
                isErr: true,
                text: "Project information not found."
            })
        }
        return messages;
    };

}());
