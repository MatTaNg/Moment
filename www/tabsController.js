angular.module('tabsController', [])
   
.controller('tabsController', ['$scope',

function ($scope) {
	$scope.camera = function() {
		console.log("CAMERA");
	};
}]);
    