(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$stateParams', '$ionicContentBanner', '$window', 'core', MomentsController]);

	function MomentsController (momentsService, $stateParams, $ionicContentBanner, $window, core) {
		var vm = this;
		vm.currentImage;
		vm.moment = {toggleDescription: "expanded"};
		vm.imageArray = [];
		vm.counter = 0;
		vm.showHR = false;
		vm.cardCSSClass = "layer-bottom";
		vm.swipedLeft = false;
		vm.swipedRight = false;
		vm.liked = liked;		
		vm.toggleDescription = toggleDescription;
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;

		this.cards = {};

		function dragRight() {
			vm.imageArray[0].swipedRight = true;
		};

		function dragLeft() {
			vm.imageArray[0].swipedLeft = true;
		};

		function release() {
			if(vm.imageArray[0].swipedRight) {
				liked(true);
			}
			if(vm.imageArray[0].swipedLeft) {
				liked(false);
			}
			vm.imageArray[0].swipedRight = false;
			vm.imageArray[0].swipedLeft = false;
		};		

		// this.cardDestroyed = function(index) {
		// 	console.log("ON DESTROY");
		// 	this.imageArray.splice(index, 1);
		// };
		if(vm.imageArray.length === 0) {
			initialize();
		}
		function initialize() { 
			momentsService.initializeView()
			.then(function(moments){
				if(moments) {
					for(var i = 1; i < moments.length; i++) {
						moments[i].class = "layer-bottom";
					}
					moments[0].class = "layer-top";
					// vm.imageArray.push(moments[0]);
					vm.imageArray = moments;
					vm.currentImage = moments[0];
				}
				else {
					console.log("INITALIZE FAIL");
					vm.imageArray = undefined;
				}
			}, function(error) {
				vm.currentImage = undefined;
				console.log(error.stack);
			});
		};

		function liked(liked) {
			core.checkAndDeleteExpiredMoment(vm.imageArray[0]);
			// vm.imageArray.splice(0, 1);
			// var counter = vm.counter;

			// momentsService.updateObject(liked, counter);

			// counter = momentsService.incrementCounter(counter);
			// console.log("COUNTER");
			// console.log(counter);
			// if(counter === -1) {
			// 	counter = 0;
			// 	momentsService.initializeView()
			// 	.then(function(moments){
			// 		if(moments.length > 0) {
			// 			for(var i = 1; i < moments.length; i++) {
			// 				moments[i].class = "layer-bottom";
			// 			}
			// 			moments[0].class = "layer-top";
			// 			vm.imageArray = moments;
			// 			vm.currentImage = moments[0];
			// 		}
			// 		else {
			// 			vm.currentImage = undefined;
			// 		}
			// 	}, function(error) {
			// 		vm.currentImage = undefined;
			// 	});
			// }
			// else {
			// 	vm.imageArray[0].class = "layer-top";
			// 	console.log("IMAGE ARRAY LENGTH");
			// 	console.log(vm.imageArray.length);
			// }
			// vm.counter = counter;
		};

		function toggleDescription() {
			if(vm.moment.toggleDescription === "contracted")
				vm.moment.toggleDescription = "expanded";
			else
				vm.moment.toggleDescription = "contracted";
		};

	};
})();