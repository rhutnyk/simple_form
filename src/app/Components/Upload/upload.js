function UploadViewController($scope, $element, $attrs, fileRest, $filter, observer, storage, stringResources, eventListener) {
    var ctrl = this;
    var provider = fileRest.getProvider('audits');

    ctrl.init = function () {
        if (ctrl.question.assets) {
            var assets = storage.get(stringResources.assets);
            angular.forEach(ctrl.question.assets, function (asset) {
                var found = $filter('filter')(assets, { Id: asset.Id });
                if (found && found.length > 0) {
                    asset.Uri = found[0].Uri;
                }
            });
        }
    }

    ctrl.resources = [];
    
    ctrl.onchange = function (eventId, newValue, parameterName) {
        if (eventId) {
            observer.fireEvent(eventId, parameterName, newValue);
        }
    }

    ctrl.registerListener = function (dependency, target) {
        if (dependency) {
            if (dependency.constructor === Array) {
                angular.forEach(dependency, function (d) {
                    observer.observe(d, target);
                });
            } else {
                observer.observe(dependency, target);
            }
        }
    }

    ctrl.upload = function () {
        var fd = new FormData();
        for (i = 0; i < ctrl.files.length; i++) {
            fd.append("file" + i, ctrl.files[i]);
        }

        provider.upload({ id: storage.get(stringResources.brandAuditId) }, fd, function (response) {
            ctrl.loading = true;
            if (!ctrl.question.assets) {
                ctrl.question.assets = [];
            }
            ctrl.question.assets = ctrl.question.assets.concat(response);
            eventListener.fire('imageUploaded', null);
        }).$promise.finally(function () {
            ctrl.loading = false;
        });
    }

    ctrl.delete = function (asset) {
        ctrl.loading = true;
        provider.remove({ id: storage.get(stringResources.brandAuditId), assetId: asset.Id }, function (response) {
            var index = ctrl.question.assets.indexOf(asset);
            ctrl.question.assets.splice(index, 1);
        }).$promise.finally(function () {
            ctrl.loading = false;
        });
    }

    $scope.uploadFileChange = function (files) {
        ctrl.selected = files.length > 0;
        ctrl.files = files;
        $scope.$apply();
    }

    ctrl.init();
}

UploadViewController.$inject = ['$scope', '$element', '$attrs', 'fileRest', '$filter', 'observer', 'storage', 'stringResources', 'eventListener'];

angular.module('app').component('uploadView', {
    templateUrl: 'components/upload/upload.html',
    controller: UploadViewController,
    bindings: {
        question: '=',
        cssclass: '@'
    }
});