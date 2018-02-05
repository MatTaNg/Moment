(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$scope', 'core','bestMomentsService', 'localStorageManager', 'constants', BestMomentsController]);
	function BestMomentsController ($scope, core, bestMomentsService, localStorageManager, constants) {
		var vm = this;
		vm.initialize = initialize;
		vm.loadingMoments = true;
		vm.moments = localStorageManager.get('bestMoments');
		vm.loadMore = loadMore;
		vm.viewComments = viewComments;

		vm.imageExpanded = false;
		vm.stopLoadingData = false;
		vm.displayCommentTray = false;
		vm.showCommentSpinner = false;
		vm.moment = {};
		vm.comments = {};
		vm.showComments = false;
		vm.commentsAndRepliesQuantity = 0;

		if(vm.moments.length === 0) {
			vm.initialize();
		}
		else {
			vm.loadingMoments = false;
		}

		function viewComments(image) {
			vm.moment = image;
			vm.showComments = !vm.showComments;
		};

		function loadMore() {
			bestMomentsService.loadMore().then(function(moments) {
				if(moments.length === 0) {
					vm.stopLoadingData = true;
				}
				bestMomentsService.momentArray = bestMomentsService.momentArray.concat(moments);
				vm.moments = vm.moments.concat(moments);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, function(error) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			})
		};

		function initialize() {
			bestMomentsService.initializeView().then(function(moments){
				vm.showCommentSpinner = false;
				vm.moments = moments;
				sortMomentsAndAddShowComments(moments);
				vm.stopLoadingData = false;
				$scope.$broadcast('scroll.refreshComplete');
				vm.loadingMoments = false;
			}, function(error) {
				vm.noMoments = true;
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function sortMomentsAndAddShowComments(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].showComments = false;
				moments[i].rank = new Date().getTime() - moments[i].time;
				moments[i].rank = moments[i].rank / constants.MILISECONDS_IN_A_DAY;
				moments[i].rank = moments[i].likes - moments[i].rank;
				if(moments[i].rank < 0) {
					core.remove(moments[i]);
				}
			}
		};
	};
})();