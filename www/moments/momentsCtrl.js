angular.module('app.momentsCtrl', [])

.controller('momentsCtrl', ['$scope', '$stateParams', 'coreSvc', 'momentsSvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, coreSvc, momentsSvc) {
	$scope.currentImage;
	$scope.moment = {toggleDescription: "expanded"};
	$scope.imageArray = [];
	$scope.counter = 0;
	$scope.showHR = false;

	$scope.liked = function(liked) {
		// localStorage.removeItem('myMoments');
		// coreSvc.getDeviceLocation();
		var counter = $scope.counter;

		momentsSvc.updateObject(liked, counter);

		counter = momentsSvc.incrementCounter(counter);
		if(counter === -1) {
			counter = 0;
			momentsSvc.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					$scope.imageArray = moments;
					$scope.currentImage = moments[0];
				}
				else {
					$scope.currentImage = undefined;
				}
			}, function(error) {
				$scope.currentImage = undefined;
			});
			//TODO: Try to fetch more moments
		}
		else {
			$scope.currentImage = momentsSvc.getMoments()[counter];
		}
		$scope.counter = counter;
	};

	$scope.toggleDescription = function() {
		if($scope.moment.toggleDescription === "contracted")
			$scope.moment.toggleDescription = "expanded";
		else
			$scope.moment.toggleDescription = "contracted";
	};
	//Initiate view
	momentsSvc.initializeView()
	.then(function(moments){
		if(moments.length > 0) {
			$scope.imageArray = moments;
			$scope.currentImage = moments[0];
		}
		else {
			$scope.currentImage = undefined;
		}
	}, function(error) {
		$scope.currentImage = undefined;
		console.log(error.stack);
	});
}])
