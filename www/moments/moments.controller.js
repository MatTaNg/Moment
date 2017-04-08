(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$stateParams', '$ionicContentBanner', '$window', 'core', '$rootScope', MomentsController]);

	function MomentsController (momentsService, $stateParams, $ionicContentBanner, $window, core, $rootScope) {
		var vm = this;
		
		// $stateParams.submittedMoment;
		vm.currentImage;
		vm.moment = {toggleDescription: "expanded"};
		vm.imageArray = core.moments;
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

		console.log("ROOT SCOPE");
		console.log($rootScope.momentTimer);

		function dragRight() {
			vm.imageArray[0].swipedRight = true;
			vm.imageArray[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.imageArray[0].swipedLeft = true;
			vm.imageArray[0].swipedFalse = false;
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

		if(vm.imageArray.length === 0) {
			// initialize();
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
					core.moments = moments;
					vm.currentImage = moments[0];
				}
				else {
					console.log("INITALIZE FAIL");
					vm.imageArray = undefined;
				}
			}, function(error) {
				vm.currentImage = undefined;
				console.log(error);
			});
		};

		function liked(liked) {
			// window.localStorage.clear();
			// core.checkAndDeleteExpiredMoment(vm.imageArray[0]);
			vm.imageArray.splice(0, 1);
			var counter = vm.counter;

			momentsService.updateObject(liked, counter);

			counter = momentsService.incrementCounter(counter);
			if(counter === -1) {
				counter = 0;
				momentsService.initializeView()
				.then(function(moments){
					if(moments.length > 0) {
						for(var i = 1; i < moments.length; i++) {
							moments[i].class = "layer-bottom";
						}
						moments[0].class = "layer-top";
						vm.imageArray = moments;
						vm.currentImage = moments[0];
					}
					else {
						vm.currentImage = undefined;
					}
				}, function(error) {
					vm.currentImage = undefined;
				});
			}
			else {
				vm.imageArray[0].class = "layer-top";
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