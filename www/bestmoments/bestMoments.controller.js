(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['core', 'constants', '$stateParams', '$scope', 'components','bestMomentsService', BestMomentsController]);
	function BestMomentsController (core, constants, $stateParams, $scope, components, bestMomentsService) {
		var vm = this;
		vm.initialize = initialize;

		// localStorage.setItem('bestMoments', "");
		vm.imageArray = JSON.parse(localStorage.getItem('bestMoments'));
		vm.imageExpanded = false;
		vm.sort = "likes";
		vm.loadMore = loadMore;
		vm.stopLoadingData = false;

		$scope.$watch('vm.sort', function() {
			vm.sort = vm.sort.toLowerCase();
			if(vm.sort === 'likes') {
				vm.sort = '-likes';
			}
		});

		if(vm.imageArray) {
			components.showLoader().then(function() {
				bestMomentsService.initializeView().then(function(moments) {
					components.hideLoader();
					vm.imageArray = moments;
				});
			})
		}

		function loadMore() {
			bestMomentsService.loadMore().then(function(moments) {
				if(moments.length === 0) {
					vm.stopLoadingData = true;
				}
				bestMomentsService.momentArray = bestMomentsService.momentArray.concat(moments);
				vm.imageArray = vm.imageArray.concat(moments);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, function(error) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			})
		};

		function initialize() {
			bestMomentsService.initializeView()
			.then(function(moments){
				vm.stopLoadingData = false;
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