(function() {
    angular.module('userNameDirective', [])

    .directive('mngUserName', mngUserName)

    function mngUserName() {
      return {
            restrict: 'AE',
            scope: { },
            templateUrl: './myMoments/userName/userName.html',
            controller: 'UserNameController',
            controllerAs: 'vm'
        };
    };
})();