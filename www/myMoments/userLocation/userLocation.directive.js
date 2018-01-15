(function() {
    angular.module('userLocationDirective', [])

    .directive('mngUserLocation', userLocationDirective)

    function userLocationDirective() {
      return {
            restrict: 'AE',
            scope: { },
            templateUrl: './myMoments/userLocation/userLocation.html',
            controller: 'UserLocationController',
            controllerAs: 'vm'
        };
    };
})();