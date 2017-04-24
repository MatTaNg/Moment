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
				console.log("MOMENTS");
				console.log(moments);
				if(moments.length > 0) {
					vm.imageArray = moments;
				}
				else {
					console.log("MOMENTS");
					vm.noMoments = true;
				}
			}, function(error) {
				vm.noMoments = true;
				console.log(error);
			});
		};
	};
})();