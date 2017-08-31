function FormViewController($state, $stateParams, $filter, $timeout, observer, identityProvider, storage, stringResources, workflow, restAudit, eventListener, datasource) {
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
        provider.get({ id: id }, function (response) {

            ctrl.data = response.FormJson;
            ctrl.title = response.Subject;
            ctrl.status = workflow.getStatus(response.Status).Name;
            ctrl.info = response;

            ctrl.manager = response.Manager;
            ctrl.accountant = response.AccountantManager;
            ctrl.fleetManager = response.FleetManager;
            ctrl.category = response.Category;

            if (ctrl.status === stringResources.statusNew) {
                $timeout(function () { ctrl.onchange("audittypechange", ctrl.category, stringResources.category) }, 3000);
            }

            angular.forEach(ctrl.autoCompleteSetup, function (callback) {
                callback();
            });

            initCommonStorage(response);

            angular.forEach(ctrl.data, function (block) {
                initFormDataStorage(block.questions);
            })
            ctrl.readonly = true;
            angular.forEach(ctrl.data, function (block) {
                block.state = workflow.get(block.workflow, response.Status);
                if (block.workflow)
                    ctrl.readonly &= !block.state.enabled;
            })
                        

        }).$promise.finally(function () {
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
        ctrl.currentUser = identityProvider.user();

        eventListener.listen('imageUploaded', function () {
            ctrl.save();
        })

        if (!ctrl.brandAuditId) {
            alert("Invalid request data: Brand Audit # is missed.");
            return;
        }

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

FormViewController.$inject = ['$state', '$stateParams', '$filter', '$timeout', 'observer', 'identityProvider', 'storage', 'stringResources', 'workflow', 'restAudit', 'eventListener', 'datasource'];

angular.module('app').component('formView', {
    templateUrl: 'components/audits/form/form.html',
    controller: FormViewController
});