(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', '$ionicLoading','bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, $ionicLoading, bestMomentsService) {
		var vm = this;
		vm.imageArray = [];
		vm.selectedOrder = "likes";
		vm.options = ['Likes', 'Location', 'Time'];
		if(JSON.parse(localStorage.getItem('bestMoments'))) {
			vm.imageArray = JSON.parse(localStorage.getItem('bestMoments'));
		}
		else {
			initialize();
		}

		function initialize() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			}).then(function() {
				bestMomentsService.initializeView()
				.then(function(moments){
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
			});
		};
	};
})();