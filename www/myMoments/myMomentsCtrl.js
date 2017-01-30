angular.module('app.myMomentsCtrl', [])

.controller('myMomentsCtrl', ['$scope','coreSvc',
	function ($scope, coreSvc) {
		$scope.myImages = ['img/food.jpg', 'img/landscape.jpg', 'img/selfie.jpg'];
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

		$scope.delete = function() {
			coreSvc.delete('test/test.jpg');
		}
	}])
