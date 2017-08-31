function AuditsListViewController($filter, rest, datasource) {
    var ctrl = this;
    var provider = rest.getProvider();
    ctrl.filter = {};
    
    var init = function () {

        load();
    }

    var load = function (ftr) {
        var params = {};
        if (ftr) {
            var filterString = '';
            if (ftr.status || ftr.status === 0) {
                filterString += "Status eq '" + ftr.status + "'";
            }
            if (ftr.auditor && ftr.auditor !== '') {
                if (filterString !== '') {
                    filterString += " and "
                }
                filterString += "Auditor eq '" + ftr.auditor + "'";
            }
            if (ftr.subject && ftr.subject !== '') {
                if (filterString !== '') {
                    filterString += " and "
                }
                filterString += "Subject eq '" + ftr.subject + "'";
            }
            if (filterString !== '')
                params = { '$filter': filterString };
        }
        ctrl.loading = true;
            provider.query(params, function (data) {
            ctrl.audits = data;
        }).$promise.finally(function () {
            ctrl.loading = false;
        });
        
    }

    ctrl.filterData = function(){
        load(ctrl.filter);
    }

    ctrl.getTemplate = function (id) {
        var found = $filter('filter')(ctrl.templates, { Id: id });
        if (found) {
            return found[0].Name;
        }
        return 'unknown';
    }

    ctrl.getStatus = function (id) {
        return '';
    }

    ctrl.delete = function (id) {
        ctrl.loading = true;
        provider.remove({ id: id }, function (response) {
            init();
        });
    }

    init();
}

AuditsListViewController.$inject = ['$filter', 'rest', 'datasource'];

angular.module('app').component('auditsList', {
    templateUrl: 'html/list.html',
    controller: AuditsListViewController
});