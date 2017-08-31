var app = angular.module('app', ['ui.router', 'ngResource', 'utils']);


app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('errorHttpInterceptor');
}]);

app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
    //$locationProvider.html5Mode(true).hashPrefix('!');

    $urlRouterProvider.otherwise('/');

    $stateProvider

        .state('audit', {
            template: '<div ui-view></div>',
            controller: function () { },
        })

        .state('audit.list', {
            url: '/?filter',
            component: 'auditsList',
        })

        .state('audit.conduct', {
            url: '/audit/conduct?id',
            component: 'formView',
        })

        .state('schedule', {
            url: '/schedule',
            component: 'schedule',
        })

        .state('schedule.list', {
            url: '/list',
            component: 'scheduleList',
            resolve: {
                resource: function () { return '' },
                editPage: function () { return 'schedule.edit' },
                filter: function () { return "Status eq '0' or Status eq '1'" }
            }
        })

        .state('schedule.edit', {
            url: '/edit?id',
            component: 'createAudit',
            resolve: {
                resource: function () { return '' },
                listPage: function () { return 'schedule.list' }
            }
        })

        .state('template', {
            template: '<div ui-view></div>',
            controller: function () { },
        })

        .state('template.list', {
            url: '/templates/list',
            component: 'templatesView',
            resolve: {
                resource: function () { return 'templates' },
                editPage: function () { return 'template.edit' },
                params: function () { return { activeOnly: false } }
            }
        })

        .state('template.edit', {
            url: '/template/edit?id',
            component: 'templateEdit',
            resolve: {
                resource: function () { return 'templates' },
                listPage: function () { return 'template.list' }
            }
        })

        .state('reports', {
            url: '/reports',
            component: 'reportsView',
        })

        .state('queue', {
            url: '/queue',
            component: 'queueList',
        });


}]);

app.factory("rest", ['$resource', function ($resource) {

    var provider = function (objType) {

        return $resource('/api/audits/:ctrl/:id',
            { ctrl: objType },
            {
                'query': { method: 'GET', isArray: true },
                'update': { method: 'PUT', isArray: false, params: { id: '@id' } }
            });
    }

    return { getProvider: provider };
}]);

app.factory("restAudit", ['$resource', function ($resource) {
    return $resource('/api/audits/:id/:action', {},
        {
            'save': { method: 'PUT', isArray: false, params: { id: '@id', action: 'data' } },
            'submit': { method: 'PUT', isArray: false, params: { id: '@id', action: 'nextstep' } },
        });
}]);

app.factory("restSources", ['$resource', function ($resource) {
    var provider = function (objType) {

        return $resource('/api/resources/:ctrl/:id',
            { ctrl: objType },
            {
                'query': { method: 'GET', isArray: true },
                'update': { method: 'PUT', isArray: false, params: { id: '@id' } }
            });
    }

    return { getProvider: provider };
}]);

app.factory("fileRest", ['$resource', function ($resource) {

    var provider = function (objType) {

        return $resource('/api/:uri/:id/assets',
            { uri: objType },
            {
                upload: {
                    method: 'POST',
                    headers: { 'Content-Type': undefined },
                    params: { id: '@id' },
                    isArray: true
                }
            }
        );
    }

    return { getProvider: provider };
}]);

app.service('datasource', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
    var _this = this;

    this.data = [];
    this.promises = [];

    this.filters = [];

    this.getData = function (resource, key, value, cacheKey) {

        var datakey = resource;

        var params = "";
        if (value) {
            params = _this.buildFilter(resource, key, value);
        }

        if (params) {
            datakey += JSON.stringify(params);
            if (cacheKey) {
                datakey += cacheKey;
            }
            var filter = '';
            angular.forEach(params, function (key, value) {
                if (filter !== '') {
                    filter += ' and ';
                }
                filter += value + " eq '" + key + "'";
            })
            params['$filter'] = filter;
        }

        if (!_this.data[datakey]) {
            if (!_this.promises[datakey]) {
                var request = {
                    url: "/api/Resources/" + resource,
                    method: "GET"
                };
                if (params) {
                    request.params = params;
                }
                _this.promises[datakey] = $http(request);
                _this.promises[datakey]
                    .then(function (response) {
                        _this.data[datakey] = response;
                    },
                    function () {
                        console.log("Failed to load" + resource);
                    });
            }
            return _this.promises[datakey];
        }

        var deferral = $q.defer();
        $timeout(function () {
            deferral.resolve(_this.data[datakey]);
        }, 100);
        return deferral.promise;
    }

    this.getDataOptions = function (resource, query) {

        var params = "";
        if (query) {
            params = { '$filter': query };
        }

        var request = {
            url: "/api/Resources/" + resource,
            method: "GET"
        };
        if (params) {
            request.params = params;
        }
        var promise = $http(request);
        promise
            .then(function (response) {
            },
            function () {
                console.log("Failed to load" + resource);
            });
        return promise;
    }

    this.buildFilter = function (resource, key, value) {
        if (key) {
            if (!_this.filters[resource]) {
                _this.filters[resource] = {};
            }
            _this.filters[resource][key] = value;
        }

        return angular.copy(_this.filters[resource]);
    }

    return {
        get: _this.getData,
        getOptions: _this.getDataOptions
    }
}]);

app.service('observer', ['datasource', function (datasource) {
    var _this = this;

    this.listeners = [];

    this.fireEvent = function (eventId, key, value) {
        angular.forEach(_this.listeners[eventId], function (listener) {
            listener(key, value);
        })
    }

    this.registerListener = function (eventId, handler) {
        if (!_this.listeners[eventId]) {
            _this.listeners[eventId] = [];
        }
        _this.listeners[eventId].push(handler);
    }

    this.setDependency = function (dependency, target, dependecyKey) {
        if (dependency) {
            //copies value
            if (dependency.value) {
                var handler = function (key, newValue) {
                    target.value = newValue;
                    if (target.notify) {
                        _this.fireEvent(target.notify.event, target.notify.parameter, target.value);
                    }
                }
                _this.registerListener(dependency.value.event, handler);
            }
            //copies specified field from resource based on given value
            //e.g. get drop down text based on selected value
            if (dependency.field) {
                var handler = function (key, newValue) {
                    if (newValue && newValue !== 'null') {
                        datasource.get(dependency.field.resource, null/*key*/, newValue)
                            .then(function (response) {
                                if (response && response.data) {
                                    angular.forEach(response.data, function (item) {
                                        if (item[dependency.field.dataValue] == newValue) {
                                            target.value = item[dependency.field.dataText];
                                            if (target.notify) {
                                                _this.fireEvent(target.notify.event, target.notify.parameter, target.value);
                                            }
                                            return;
                                        }
                                    })
                                }
                            });
                    } else {
                        target.value = null;
                    }
                }
                _this.registerListener(dependency.field.event, handler);
            }
            //requests an object from server and takes specified field of returned obj
            if (dependency.data) {
                var handler = function (key, newValue) {
                    if (newValue && newValue !== 'null') {
                        datasource.get(dependency.data.resource, key, newValue)
                            .then(function (response) {
                                if (response && response.data && response.data.length > 0) {
                                    target.value = response.data[0][dependency.data.datafield];
                                    if (target.notify) {
                                        _this.fireEvent(target.notify.event, target.notify.parameter, target.value);
                                    }
                                }
                            });
                    } else {
                        target.value = null;
                    }
                }
                _this.registerListener(dependency.data.event, handler);
            }
            //shows or hides element
            if (dependency.visibility) {
                var handler = function (key, newValue) {
                    target.invisible = dependency.visibility.value !== newValue;
                }
                _this.registerListener(dependency.visibility.event, handler);
            }
            //requests collection from server (conditional table binding)
            if (dependency.list) {
                var handler = function (key, newValue) {
                    if (newValue && newValue !== 'null') {
                        datasource.get(dependency.list.resource, key, newValue, dependecyKey)
                            .then(function (response) {
                                if (response && response.data) {
                                    var targetField = 'data';
                                    if (dependency.list.target) {
                                        targetField = dependency.list.target;
                                    }
                                    if (dependency.list.datafield) {
                                        target[targetField] = response.data[dependency.list.datafield];
                                    } else {
                                        target[targetField] = response.data;
                                    }
                                }
                                else {
                                    target.data = null;
                                }
                            });
                    } else {
                        target.data = null;
                    }
                }
                _this.registerListener(dependency.list.event, handler);
            }
            //project specific logic
            if (dependency.tableSum) {
                var handler = function (key, table) {
                    var sum = {
                        type: key,
                        qty: 0, onHandQty: 0, auditedQty: 0, qtyDiff: 0, onHandVal: 0, auditedVal: 0, valDiff: 0
                    };
                    if (table) {
                        angular.forEach(table, function (row) {
                            sum.qty++;
                            sum.onHandQty += row.OnhandQty;
                            sum.auditedQty += row.AuditQty;
                            sum.qtyDiff += row.AuditQty - row.OnhandQty;
                            sum.onHandVal += row.OnhandQty * row.Cost;
                            sum.auditedVal += row.AuditQty * row.Cost;
                            sum.valDiff += (row.AuditQty - row.OnhandQty) * row.Cost;
                        });
                        target.data[key === 'Tools' ? 0 : 1] = sum;
                    }
                }
                _this.registerListener(dependency.tableSum.event, handler);
            }
            if (dependency.data_violations) {
                var handler = function (key, newValue) {
                    if (newValue && newValue !== 'null') {
                        datasource.get(dependency.data_violations.resource, key, newValue)
                            .then(function (response) {
                                if (response && response.data) {
                                    target.value = response.data[dependency.data_violations.datafield];
                                    if (target.notify) {
                                        _this.fireEvent(target.notify.event, target.notify.parameter, target.value);
                                    }
                                }
                            });
                    } else {
                        target.value = null;
                    }
                }
                _this.registerListener(dependency.data_violations.event, handler);
            }
        }
    }

    return {
        fireEvent: _this.fireEvent,
        observe: _this.setDependency
    }

}]);

app.service('stringResources', function () {
    return {
        brandAuditId: 'brandAuditId',
        assets: 'assets',
        auditor: 'auditor',
        auditDate: 'date',
        subject: 'subject',
        auditId: 'id',
        manager: 'manager',
        accountant: 'accountant',
        fleetManager: 'fleetmgr',
        category: 'category',
        statusNew: 'New'
    }
})

app.service('templateHelper', function () {

    var _this = this;

    this.get = function (itemType) {
        var tmpl;
        switch (itemType) {
            case 'check':
                tmpl = 'templates/tmpl-chk.html';
                break;
            case 'radio':
                tmpl = 'templates/tmpl-radio.html';
                break;
            case 'select':
                tmpl = 'templates/tmpl-select.html';
                break;
            case 'content':
                tmpl = 'templates/tmpl-content.html';
                break;
            case 'long-txt':
                tmpl = 'templates/tmpl-txt-area.html';
                break;
            case 'upload':
                tmpl = 'templates/tmpl-upload.html';
                break;
            case 'label':
                tmpl = 'templates/tmpl-lbl.html';
                break;
            //app specific templates
            case 'tools-audit':
                tmpl = 'templates/tmpl-tbl.html';
                break;
            case 'tools-notes':
                tmpl = 'templates/tmpl-toolsnotes.html';
                break;
            case 'outcome':
                tmpl = 'templates/tmpl-outcome.html';
                break;
            case 'speeding':
                tmpl = 'templates/tmpl-speeding.html';
                break;
            default:
                tmpl = 'templates/tmpl-txt.html';
                break;
        }
        return tmpl;
    }

    return {
        getTemplate: _this.get
    }
});
