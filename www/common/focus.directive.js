(function() {
    angular.module('autoFocus', [])
	.directive('mngAutoFocus', ['$timeout', function ($timeout) {
	    return {
	        restrict: 'A',
	        link: function ($scope, $element) {
	        	console.log("ASDASD");
	            $timeout(function () {
	                $element[0].focus();
	            });
	        }
	    }
    }])
})();