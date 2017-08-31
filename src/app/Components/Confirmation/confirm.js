function comfirmController() {
    var ctrl = this;

    ctrl.act = function () {
        if (window.confirm(ctrl.msg)) {
            ctrl.onConfirm();
        }
    }
}

comfirmController.$inject = [];

angular.module('app').component('confirm', {
    templateUrl: 'html/confirm.html',
    controller: comfirmController,
    bindings: {
        text: '@',
        msg: '@',
        iconClass: '@',
        title: '@',
        onConfirm: '&'
    }
});