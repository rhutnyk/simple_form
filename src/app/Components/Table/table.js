function TableViewController(observer, storage, templateHelper, stringResources) {
    var ctrl = this;

    ctrl.resources = [];

    ctrl.orderBy = 'BinNumber';
    ctrl.sortDirection = true;

    ctrl.getTemplate = function (table) {
        return templateHelper.getTemplate(table.type);
    }

    ctrl.onchange = function (eventId, paramName) {
        if (eventId) {
            observer.fireEvent(eventId, paramName, ctrl.table.data);
        }
    }

    ctrl.add = function (item) {
        if (!ctrl.table.data) {
            ctrl.table.data = [];
        }
        ctrl.table.data.push(item);
    }

    ctrl.registerListener = function (dependency, target) {
        angular.forEach(dependency, function (d) {
            observer.observe(d, target, storage.get(stringResources.brandAuditId));
        });
        //observer.observe(dependency, target);
    }
}

TableViewController.$inject = ['observer', 'storage', 'templateHelper', 'stringResources'];

angular.module('app').component('tableView', {
    templateUrl: 'html/table.html',
    controller: TableViewController,
    bindings: {
        table: '='
    }
});