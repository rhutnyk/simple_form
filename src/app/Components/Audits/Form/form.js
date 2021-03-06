﻿function FormViewController($state, $stateParams, $filter, $http, $timeout, observer, storage, stringResources, restAudit, eventListener, datasource) {
    var ctrl = this;

    var provider = restAudit;
    ctrl.processing = {};
    ctrl.resources = {};

    ctrl.autocomplete = [];
    ctrl.autoCompleteSetup = [];

    ctrl.workflowDisabled = true;

    var initFormDataStorage = function (questions) {
        angular.forEach(questions, function (question) {
            if (question.value && question.notify && question.notify.parameter) {
                storage.set(question.notify.parameter, question.value);
            }
            if (question.childQuestions) {
                initFormDataStorage(question.childQuestions);
            }
        })
    }

    var initCommonStorage = function (data) {
        storage.set(stringResources.assets, data.Assets);
        storage.set(stringResources.auditor, data.Auditor);
        storage.set(stringResources.auditDate, data.ScheduledDate);
        storage.set(stringResources.subject, data.Subject);
        storage.set(stringResources.auditId, data.Id);  
        //storage.set(stringResources.category, data.Category);  
    }

    ctrl.getData = function (key) {
        ctrl.processing[key] = true;
        datasource.get(key)
            .then(function (response) {
                ctrl.resources[key] = response.data;
            })
            .finally(function () {
                ctrl.processing[key] = false;
            });
    }

    /*Autocomplete processing*/
    ctrl.setAutocomplete = function (source, target) {
        ctrl.autoCompleteSetup.push(function () {
            ctrl.autocomplete[target] = ctrl[source];
        });
    }

    ctrl.getDataOptions = function (resource, key, value, role) {
        var query = '';
        if (value) {
            query = "contains('" + value + "'," + key + ")";
        }

        if (role) {
            if (query) {
                query += ' and ';
            }
            query += "Role eq '" + role + "'";
        }
        var promise = datasource.getOptions(resource, query)
            .then(function (response) {
                ctrl.data[key] = response.data;
                return response.data;
            });
        return promise;
    }
    /*Autocomplete processing - END*/

    var getChecklist = function (id) {
        ctrl.loading = true;
        $http({
            //url: "/api/Checklist/Template",
            url: "../Temp/sample.json",
            method: "GET",
            params: { 'id': id }
        }).then(function (response) {
            //ctrl.data = response.data.Data;
            //ctrl.title = response.data.Title;
            ctrl.data = response.data;
            ctrl.title = "Simple Form - SAMPLE";
        },
            function () {
                alert("Checklist loading failed.");
            }).finally(
            function () {
                ctrl.loading = false;
            });
    }

    ctrl.onchange = function (eventId, newValue, parameterName) {
        if (eventId) {
            storage.set(parameterName, newValue);
            observer.fireEvent(eventId, parameterName, newValue);
        }
    }

    var init = function () {
        ctrl.brandAuditId = $stateParams.id;

        eventListener.listen('imageUploaded', function () {
            ctrl.save();
        })

        storage.set(stringResources.brandAuditId, ctrl.brandAuditId);
        getChecklist(ctrl.brandAuditId);                
    }

    ctrl.save = function () {
        ctrl.auditForm.submitted = true;
        if (!ctrl.auditForm.$valid) {
            alert('Please fill in required fields');
            return;
        }

        ctrl.loading = true;
        provider.save({ id: ctrl.brandAuditId }, { data: ctrl.data, manager: ctrl.manager, accountantManager: ctrl.accountant, fleetManager: ctrl.fleetManager }, function (response) {
            alert('Checklist has been saved.');
        },
            function () {
                alert('Failed to save checklist.');
            }
        ).$promise.finally(function () {
            ctrl.loading = false;
            ctrl.auditForm.submitted = false;
        });
    };

    ctrl.submit = function () {
        ctrl.auditForm.submitted = true;
        if (!ctrl.auditForm.$valid) {
            alert('Please fill in required fields');
            return;
        }

        ctrl.loading = true;
        provider.save({ id: ctrl.brandAuditId }, { data: ctrl.data, manager: ctrl.manager, accountantManager: ctrl.accountant, fleetManager: ctrl.fleetManager }, function (response) {
            provider.submit({ id: ctrl.brandAuditId }, function () {
                alert('Checklist has been submitted.');
                $state.go('audit.list');
            },
                function () {
                    alert('Failed to save checklist.');
                }).$promise.finally(function () {
                    ctrl.loading = false;
                    ctrl.auditForm.submitted = false;
                });
        },
            function () {
                alert('Failed to save checklist.');
                ctrl.loading = false;
                ctrl.auditForm.submitted = false;
            }
        );
    };

    init();
}

FormViewController.$inject = ['$state', '$stateParams', '$filter', '$http', '$timeout', 'observer', 'storage', 'stringResources', 'restAudit', 'eventListener', 'datasource'];

angular.module('app').component('formView', {
    templateUrl: 'html/form.html',
    controller: FormViewController
});