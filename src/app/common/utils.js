var utils = angular.module('utils', []);

utils.service('$localstorage', function () {
    var _this = this;

    this.get = function (name) {
        return JSON.parse(localStorage.getItem(name));
    }

    this.set = function (name, obj) {
        localStorage.setItem(name, JSON.stringify(obj));
    }
    this.remove = function (name, key) {
        var data = _this.get(key);
        for (i = 0; i < data.length; i++) {
            if (data[i].name == name) {
                data.splice(i, 1);

                _this.set(key, data);
            }
        }
    }

    return {
        getObj: _this.get,
        setObj: _this.set,
        removeObj: _this.remove
    }

})

utils.service('storage', function () {
    var _this = this;
    this.storage = {};

    return {
        get: function (key) {
            return _this.storage[key];
        },
        set: function (key, value) {
            _this.storage[key] = value;
        }
    }
})

utils.service('eventListener', function () {
    var _this = this;

    var listeners = {};

    this.listen = function (eventId, handler) {
        if (!listeners[eventId]) {
            listeners[eventId] = [];
        }
        listeners[eventId].push(handler);
    }

    this.fireEvent = function (eventId, args) {
        if (listeners[eventId]) {
            angular.forEach(listeners[eventId], function (handler) {
                handler(args);
            })
        }
    }

    return {
        listen: _this.listen,
        fire: _this.fireEvent
    }
})

utils.factory('errorHttpInterceptor', ['$q', '$log', function ($q, $log) {
    return {
        'responseError': function (rejection) {
            alert(rejection.data ? rejection.data.ExceptionMessage : 'Failed to process request.');
            $log.error((rejection.data ? rejection.data.ExceptionMessage : 'Failed to process request.'));
            return $q.reject(rejection);
        }
    };
}]);