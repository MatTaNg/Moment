angular.module('app.momentListCtrl', [])

.controller('momentListCtrl', ['$scope', '$stateParams', 'coreSvc', 'momentListSvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, coreSvc, momentListSvc) {
	$scope.imageArray = [];
	$scope.selectedOrder = "likes";
	$scope.options = ['likes', 'location', 'time'];

		//Initiate view
		momentListSvc.initializeView()
		.then(function(moments){
			if(moments.length > 0) {
				$scope.imageArray = moments;
			}
			else {
				$scope.noMoments = true;
			}
		}, function(error) {
			$scope.noMoments = true;
			console.log(error.stack);
		});
	}])

//TODO:
//initiateBucket Scope does not update properly in the closure loop
