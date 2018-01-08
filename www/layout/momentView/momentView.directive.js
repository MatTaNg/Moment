(function() {
    angular.module('momentViewDirective', [])

    .directive('mngMomentView', mngMomentView)

    function mngMomentView() {
        return {
            restrict: 'AE',
            scope: true,
            templateUrl: './layout/momentView/momentView.html',
            controller: 'MomentViewController',
        };
    };
})();