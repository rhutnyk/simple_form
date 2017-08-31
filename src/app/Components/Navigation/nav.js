function navController(identityProvider) {
    var ctrl = this;
    
    var init = function () {
        ctrl.user = identityProvider.user().emplCode;
    }

    init();
}

navController.$inject = ['identityProvider'];

angular.module('app').component('navView', {
    templateUrl: 'components/navigation/nav.html',
    controller: navController
});