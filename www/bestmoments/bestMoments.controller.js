(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$stateParams', 'core', 'bestMomentsService', BestMomentsController]);
	function BestMomentsController ($stateParams, core, bestMomentsService) {
		var vm = this;
		
		console.log("BEST MOMENTS");
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