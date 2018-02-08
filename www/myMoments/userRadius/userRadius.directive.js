(function() {
    angular.module('userRadiusDirective', [])

    .directive('mngUserRadius', userRadiusDirective)

    function userRadiusDirective() {
      return {
            restrict: 'AE',
            scope: { },
            templateUrl: './myMoments/userRadius/userRadius.html',
            controller: 'UserRadiusController',
            controllerAs: 'vm'
        };
    };
})();