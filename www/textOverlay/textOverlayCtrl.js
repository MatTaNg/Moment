angular.module('app.textOverlayCtrl', [])
  
.controller('textOverlayCtrl', ['$scope', '$stateParams', '$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state) {

	(function init() {
		$scope.momentPicture = document.getElementById('momentPicture');
		$scope.momentPicture.src = "data:image/jpeg;base64," + $stateParams.picture;
		console.log($scope.momentPicture.src);
	})();

	$scope.back = function() {
		console.log("Back");
		$state.go('tabsController.camera');
	};
}])