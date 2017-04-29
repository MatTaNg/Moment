(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', '$scope', '$ionicLoading','bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, $scope, $ionicLoading, bestMomentsService) {
		var vm = this;
		vm.initialize = initialize;

		vm.imageArray = [];
		vm.selectedOrder = "Likes";
		vm.options = ['Likes', 'Location', 'Time'];
		vm.imageExpanded = false;

		if(JSON.parse(localStorage.getItem('bestMoments'))) {
			vm.imageArray = JSON.parse(localStorage.getItem('bestMoments'));
			//the image arrays must have certain properties because of how ion-gallery works
			for(var i = 0; i < vm.imageArray.length; i++) {
				vm.imageArray[i].src = vm.imageArray[i].key;
				vm.imageArray[i].sub = vm.imageArray[i].description;
			}
		}
		else {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			}).then(function() {
				initialize().then(function() {
					$ionicLoading.hide();
				});
			});
			vm.temp = imageArray[0];
		}

		function initialize() {
			bestMomentsService.initializeView()
			.then(function(moments){
				$scope.$broadcast('scroll.refreshComplete');
				$ionicLoading.hide().then(function() {
					if(moments.length > 0) {
						vm.imageArray = moments;
					}
					else {
						vm.noMoments = true;
					}
				});
			}, function(error) {
				$ionicLoading.hide().then(function() {
					vm.noMoments = true;
					console.log(error);
				});
			});
		};
	};
})();