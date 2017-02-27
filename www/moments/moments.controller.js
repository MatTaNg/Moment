(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', MomentsController]);

	function MomentsController (momentsService) {
		var vm = this;
		vm.currentImage;
		vm.moment = {toggleDescription: "expanded"};
		vm.imageArray = [];
		vm.counter = 0;
		vm.showHR = false;
		vm.liked = liked;		
		vm.toggleDescription = toggleDescription;

		// console.log(moments);
		initialize();
		// function initialize() {
		// 	console.log(moments.length);
		// 	if(moments.length > 0) {
		// 		vm.imageArray = moments;
		// 		vm.currentImage = moments[0];
		// 	}
		// 	else {
		// 		vm.currentImage = undefined;
		// 	}
		// };
		function initialize() { 
			console.log("CTRL INIT");
			momentsService.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					vm.imageArray = moments;
					vm.currentImage = moments[0];
				}
				else {
					vm.currentImage = undefined;
				}
			}, function(error) {
				vm.currentImage = undefined;
				console.log(error.stack);
			});
		};

		function liked(liked) {
// localStorage.removeItem('myMoments');
		// core.getDeviceLocation();
		var counter = vm.counter;

		momentsService.updateObject(liked, counter);

		counter = momentsService.incrementCounter(counter);
		if(counter === -1) {
			counter = 0;
			momentsService.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					vm.imageArray = moments;
					vm.currentImage = moments[0];
				}
				else {
					vm.currentImage = undefined;
				}
			}, function(error) {
				vm.currentImage = undefined;
			});
			//TODO: Try to fetch more moments
		}
		else {
			vm.currentImage = momentsService.getMoments()[counter];
		}
		vm.counter = counter;
	};

	function toggleDescription() {
		if(vm.moment.toggleDescription === "contracted")
			vm.moment.toggleDescription = "expanded";
		else
			vm.moment.toggleDescription = "contracted";
	};

};
})();