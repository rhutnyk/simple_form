function QuestionViewController($element, $attrs, $timeout, observer, datasource, templateHelper, storage) {
    var ctrl = this;

    ctrl.resources = [];
           
    ctrl.getTemplate = function (question) {
        return templateHelper.getTemplate(question.type);
    }
    
    ctrl.getResource = function (resourceName) {
        if (!resourceName)
            return;
        ctrl.loading = true;
        datasource.get(resourceName)
            .then(function (response) {
                ctrl.resources[resourceName] = response.data;
            }).finally(function () {
                ctrl.loading = false;
            });
    }

    ctrl.onchange = function (eventId, newValue, parameterName) {
        if (eventId) {
            storage.set(parameterName, newValue);
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

    var init = function () {
       
        if (!ctrl.question.value && ctrl.question.default) {
            if (ctrl.question.default.storage) {
                ctrl.question.value = storage.get(ctrl.question.default.storage);
                if (ctrl.question.notify) {
                    $timeout(function () { ctrl.onchange(ctrl.question.notify.event, ctrl.question.value, ctrl.question.notify.parameter); }, 2000);
                }
            }
        }

        if (ctrl.question.inputType && ctrl.question.inputType == 'Date') {
            if (ctrl.question.value) {
                ctrl.question.value = new Date(ctrl.question.value);
            }
        }

        //ctrl.registerListener($ctrl.question.dependency, $ctrl.question)
    }

    init();
}

QuestionViewController.$inject = ['$element', '$attrs', '$timeout', 'observer', 'datasource', 'templateHelper', 'storage'];

angular.module('app').component('questionView', {
    templateUrl: 'components/question/question.html',
    controller: QuestionViewController,
    bindings: {
        question: '=',
        cssclass: '@'
    }
});