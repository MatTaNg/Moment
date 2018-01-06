(function() {
    angular.module('app.momentsDirective', [])

    .directive('mngDescription', mngMainView)

    function mngMainView() {
      return {
        restrict: 'AE',
        scope: {
            moment: '=' 
        },
        templateUrl: '../layout/moment.html'
    };
};
})();