(function() {
    angular.module('commentsDirective', [])

    .directive('mngComments', mngComments)

    function mngComments() {
        return {
            restrict: 'AE',
            scope: { },
            templateUrl: './comments/comments.html',
            controller: 'CommentsController',
            controllerAs: 'vm',
            bindToController: {   
                moment: '=',
                showComments: '=',
                momentsArray: '=',
                localStorageName: '@'
            }
        };
    };
})();