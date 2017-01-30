angular.module('app.momentListCtrl', [])
   
.controller('momentListCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
	// console.log(device.uuid);
	// alert(device.uuid);
	$scope.currentImage = ['img/food.jpg', 'img/landscape.jpg', 'img/selfie.jpg'];
	$scope.likes = [3, 5, 12];
	$scope.location = ['Narberth, PA', 'Pittsburgh, PA', 'Cherry Hill, NJ'];
	$scope.time = ['12:04pm', '8:01am', '7:02pm'];

	$scope.screenWidth = window.screen.width * 0.9;
	$scope.screenHeight = window.screen.height;
	
	var imageArray = ['img/food.jpg', 'img/landscape.jpg', 'img/selfie.jpg'];
	var likes = [3, 5, 12];
	var location = ['Narberth, PA', 'Pittsburgh, PA', 'Cherry Hill, NJ'];
	var time = ['12:04pm', '8:01am', '7:02pm'];
	var counter = 0;
}])