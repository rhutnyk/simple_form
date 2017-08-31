function navController() {
    var ctrl = this;
    
    var init = function () {
        
    }

    init();
}

navController.$inject = [];

angular.module('app').component('navView', {
    templateUrl: 'html/nav.html',
    controller: navController
});