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
			momentsService.initializeView()
			.then(function(moments){
				console.log("MOMENTS");
				console.log(moments);
				if(moments.length > 0) {
					console.log("MOMENT ARRAY");
					vm.imageArray = moments;
					vm.currentImage = moments[0];
					console.log(vm.currentImage);
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
			// console.log("LIKED");
			// console.log(momentsService.getDeviceLocation());
			// console.log(momentsService.getDeviceLocation());
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