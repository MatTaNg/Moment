(function() {
    angular.module('userNotificationsDirective', [])

    .directive('mngUserNotifications', mngUserNotificationsDirective)

    function mngUserNotificationsDirective() {
      return {
            restrict: 'AE',
            scope: { },
            templateUrl: './myMoments/userNotifications/userNotifications.html',
            controller: 'UserNotificationsController',
            controllerAs: 'vm'
        };
    };
})();