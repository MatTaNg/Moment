(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', '$scope', 'components','bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, $scope, components, bestMomentsService) {
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
			components.showLoader()
			.then(function() {
				initialize().then(function() {
					components.hideLoader();
				});
			});
			vm.temp = imageArray[0];
		}

		function initialize() {
			bestMomentsService.initializeView()
			.then(function(moments){
				$scope.$broadcast('scroll.refreshComplete');
				components.hideLoader().then(function() {
					if(moments.length > 0) {
						vm.imageArray = moments;
					}
					else {
						vm.noMoments = true;
					}
				});
			}, function(error) {
				components.hideLoader().then(function() {
					vm.noMoments = true;
					console.log(error);
				});
			});
		};
	};
})();