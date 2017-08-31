function EditViewController($state, $stateParams, datasource, rest) {
    var ctrl = this;
    var provider = rest.getProvider(ctrl.resource);

    ctrl.entity = {};

    ctrl.data = {};

    ctrl.dateFields = [];

    ctrl.autoCompleteSetup = [];

    ctrl.processing = {};

    var init = function (id) {
        if (id) {
            ctrl.loading = true;
            provider.get({ id: id }, function (data) {
                ctrl.entity = data;
                angular.forEach(ctrl.dateFields, function (field) {
                    ctrl.entity[field] = new Date(ctrl.entity[field]);
                });
                angular.forEach(ctrl.autoCompleteSetup, function (callback) {
                    callback();
                });
            }).$promise.finally(function () {
                ctrl.loading = false;
            });
        }
    }

    ctrl.getData = function (key) {
        ctrl.processing[key] = true;
        var promise = datasource.get(key)
            .then(function (response) {
                ctrl.data[key] = response.data;
                return response.data;
            })
            .finally(function () {
                ctrl.processing[key] = false;
            });
        return promise;
    }

    ctrl.getDataOptions = function (resource, key, value) {

        var query = "";
        if (value) {
            query = "startswith(" + key + ",'" + value + "')";
        }

        var promise = datasource.getOptions(resource, query)
            .then(function (response) {
                ctrl.data[key] = response.data;
                return response.data;
            });
        return promise;
    }

    ctrl.setAutocomplete = function (source, target) {
        ctrl.autoCompleteSetup.push(function () {
            ctrl[target] = ctrl.entity[source];
        });        
    }

    ctrl.save = function () {
        ctrl.form.submitted = true;
        if (!ctrl.form.$valid) {
            return;
        }

        ctrl.loading = true;
        var id = $stateParams.id;
        if (id) {
            provider.update({id: id}, ctrl.entity, function (response) {
                $state.go(ctrl.listPage);
            }).$promise.finally(function () {
                ctrl.loading = false;
            });
        }
        else {
            provider.save(ctrl.entity, function (response) {
                $state.go(ctrl.listPage);
            }).$promise.finally(function () {
                ctrl.loading = false;
                ctrl.form.submitted = false;
            });
        }
    }

    init($stateParams.id);
}

EditViewController.$inject = ['$state', '$stateParams', 'datasource', 'rest'];