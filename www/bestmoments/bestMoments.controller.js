(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', '$scope', 'components','bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, $scope, components, bestMomentsService) {
		var vm = this;
		vm.initialize = initialize;

		vm.imageArray = JSON.parse(localStorage.getItem('bestMoments'));
		vm.selectedOrder = "Likes";
		vm.options = ['Likes', 'Location', 'Time'];
		vm.imageExpanded = false;

		if(vm.imageArray.length === 0) {
			components.showLoader().then(function() {
				bestMomentsService.initializeView().then(function(moments) {
					components.hideLoader();
					vm.imageArray = moments;
				});
			})
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
				console.log("ERROR");
				components.hideLoader().then(function() {
					vm.noMoments = true;
					console.log(error);
				});
			});
		};
	};
})();