(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', 'bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, bestMomentsService) {
		var vm = this;
		
		vm.imageArray = [];
		vm.selectedOrder = "likes";
		vm.options = ['likes', 'location', 'time'];

		initialize();

		function initialize() {
			bestMomentsService.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					vm.imageArray = moments;
				}
				else {
					vm.noMoments = true;
				}
			}, function(error) {
				vm.noMoments = true;
				console.log(error.stack);
			});
		};
	};
})();