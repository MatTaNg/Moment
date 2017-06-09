(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$scope', '$ionicContentBanner', 'core', 'components', '$q', '$ionicPopup', '$window', 'constants', MomentsController]);

	function MomentsController (momentsService, $scope, $ionicContentBanner, core, components, $q, $ionicPopup, $window, constants) {
		var vm = this;
		
		vm.moments = JSON.parse(localStorage.getItem('moments'));
		vm.liked = liked;		
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;
		vm.flagged = flagged;
		vm.flagClass = "ion-ios-flag-outline";
		vm.cardCSSClass = "layer-bottom";
		vm.swipedLeft = false;
		vm.swipedRight = false;

		if(!vm.moments) {
			vm.moments = [];
		}

		if(core.appInitialized === false || vm.moments.length === 0 || core.didUserChangeRadius) {
			core.appInitialized = true;
			initialize();
		}

		function dragRight() {
			vm.moments[0].swipedRight = true;
			vm.moments[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.moments[0].swipedLeft = true;
			vm.moments[0].swipedRight = false;
		};

		function release(event) {
			var threshold = $window.innerWidth * constants.HOW_CLOSE_TO_EDGE_OF_SCREEN_USER_MUST_DRAG_MOMENT;
			var touchXposition = event.gesture.center.pageX;
			if(touchXposition < threshold) {
				vm.liked(false);
			}
			else if(touchXposition > $window.innerWidth - threshold) {
				vm.liked(true);
			}
			else {
				vm.moments[0].swipedRight = false;
				vm.moments[0].swipedLeft = false;
			}
		};		

		function initialize() { 
			components.showLoader().then(function() {
				momentsService.initializeView()
				.then(function(moments){
					console.log(moments);
					vm.moments = moments;
					components.hideLoader();
				}, function(error) {
					console.log("ERRROR");
					console.log(error);
					components.hideLoader().then(function() {
						$ionicContentBanner.show({
							text: ["An error occured getting the Moment."],
							type: "error",
							autoClose: 3000
						});
					});
				}); //End of initializeView
			}); //End of popup;
		};

		function liked(liked) {
			momentsService.momentArray = vm.moments; //Moment Array in the service makes itself undefined for no reason
			sendReport().then(function() {
				momentsService.updateMoment(liked).then(function(moments) {
					components.hideLoader().then(function(){
						vm.moments = moments;
						vm.flagClass = "ion-ios-flag-outline";
					}, function(error) {
						initialize();
						}); //End of ionic Hide
				}, function(error) {
					components.hideLoader().then(function() {
						$ionicContentBanner.show({
							text: ["An error occured getting the next Moment."],
							type: "error",
							autoClose: 3000
						});
					});
					});//End of updateMoment
					});//End of sendReport
		};

		function sendReport() {
			var deferred = $q.defer();
			if(vm.disableFlag) {
				components.showLoader()
				.then(function() {
					momentsService.uploadReport(vm.report, momentsService.momentArray[0]).then(function() {
						deferred.resolve();
					}, function(error) {
					})
					vm.disableFlag = false;
					return deferred.promise;
			}); //End of ionic Loading
			} else {
				deferred.resolve();
			}
			return deferred.promise;
		};

		function flagged() {
			if(!vm.disableFlag) {
				vm.disableFlag = true;
				var popup = $ionicPopup.show({
					template: '<textarea ng-model="vm.report" placeholder="What\'s bothering you? (optional)" style="height: 100px; margin-bottom: 10px"> </textarea>',
					title: 'Report',
					scope: $scope,
					buttons: [ 
					{ text: 'Cancel',
					onTap: function(e) {
						vm.disableFlag = false;
					} 
				},
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!vm.report) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								vm.flagClass = "ion-ios-flag";
								$ionicContentBanner.show({
									text: ["You have flagged this Moment"],
									autoClose: 3000
								});
							};
						}
						
					}
					]
				});
			} else if(vm.report) {
				vm.disableFlag = false;
				vm.flagClass = "ion-ios-flag-outline";
				$ionicContentBanner.show({
					text: ["You have unflagged this Moment"],
					autoClose: 3000
				});
			}
		};
	}
})();