(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$stateParams', '$ionicContentBanner', '$window', 'core', '$rootScope', 'constants', MomentsController]);

	function MomentsController (momentsService, $stateParams, $ionicContentBanner, $window, core, $rootScope, constants) {
		var vm = this;
		vm.currentImage;
		vm.moment = {toggleDescription: "expanded"};
		if(localStorage.getItem('moments')) {
			vm.imageArray = JSON.parse(localStorage.getItem('moments'));
			for(var i = 0; i < vm.imageArray.length; i++) {
				vm.imageArray[i].time = core.timeElapsed(vm.imageArray[i].time);
			}
		}
		else {
			vm.imageArray = [];
		}
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
			vm.imageArray[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.imageArray[0].swipedLeft = true;
			vm.imageArray[0].swipedRight = false;
		};

		function release() {
			if(vm.imageArray) {
				vm.imageArray[0].swipedRight = false;
				vm.imageArray[0].swipedLeft = false;
			}
		};		

		if(vm.imageArray.length === 0) {
			initialize();
		}
		function initialize() { 
			updateView();
		};

		function updateView() {
			vm.imageArray = [];
			momentsService.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					vm.imageArray = updateObject(moments);
				}
			}, function(error) {
				vm.currentImage = undefined;
			});
		};

		function liked(liked) {
			// core.checkAndDeleteExpiredMoment(vm.imageArray[0]);
			momentsService.updateMoment(liked).then(function(moments) {
				vm.imageArray = updateObject(moments);
			}, function(error) {
				updateView();
			});

		};

		function updateObject(moments) {
			// localStorage.setItem("moments", JSON.stringify(moments));
			vm.imageArray = moments;
			for(var i = 0; i < moments.length; i++) {
				moments[i].class = "layer-bottom";
				moments[i].time = core.timeElapsed(vm.imageArray[i].time);
			}
			moments[0].class = "layer-top";
			return moments;
		};

		function toggleDescription() {
			if(vm.moment.toggleDescription === "contracted")
				vm.moment.toggleDescription = "expanded";
			else
				vm.moment.toggleDescription = "contracted";
		};

	};
})();