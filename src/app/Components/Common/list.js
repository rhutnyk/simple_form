function ListViewController($filter, rest, workflow, datasource) {
    var ctrl = this;

    ctrl.data = {};

    var provider = rest.getProvider(ctrl.resource);
    
    var init = function () {
        ctrl.loading = true;

        var params = {};

        if (ctrl.params) {
            params = ctrl.params;
        }

        if (ctrl.filter) {
            params['$filter'] = ctrl.filter;
        }        

        provider.query(params, function (data) {
            ctrl.list = data;
        }).$promise.finally(function () {
            ctrl.loading = false;
        });
    }

    ctrl.getData = function (key) {
        //ctrl.processing[key] = true;
        var promise = datasource.get(key)
            .then(function (response) {
                ctrl.data[key] = response.data;
                return response.data;
            })
            .finally(function () {
                //ctrl.processing[key] = false;
            });
        return promise;
    }

    ctrl.resolveResourceName = function (resource, dataKey, displayField) {
        var found = $filter('filter')(ctrl.data[resource], { Id: dataKey });
        if (found) {
            return found[0][displayField];
        }
        return 'unknown';
    }

    ctrl.getStatus = function (id) {
        return workflow.getStatus(id);
    }

    ctrl.delete = function (id) {
        ctrl.loading = true;
        provider.remove({ id: id }, function (response) {
            init();
        });
    }

    init();
}

ListViewController.$inject = ['$filter', 'rest', 'workflow', 'datasource'];