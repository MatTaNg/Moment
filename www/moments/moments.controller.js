(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['$timeout', '$rootScope', 'momentsService', '$stateParams', '$scope', '$ionicContentBanner', 'core', 'components', '$q', '$ionicPopup', '$window', 'constants', '$interval', 'localStorageManager', MomentsController]);

	function MomentsController ($timeout, $rootScope, momentsService, $stateParams, $scope, $ionicContentBanner, core, components, $q, $ionicPopup, $window, constants, $interval, localStorageManager) {
		var vm = this;

		vm.moments = localStorageManager.get('moments');
		vm.liked = liked;		
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;
		vm.flagged = flagged;
		vm.setCoords = setCoords;
		vm.flagClass = "ion-ios-flag-outline";
		vm.cardCSSClass = "layer-hide";
		vm.swipedLeft = false;
		vm.swipedRight = false;
		vm.loadingMoments = false;
		vm.currentLocation = core.currentLocation;
		vm.touchXposition = 0;
		vm.keepFindingLocation = keepFindingLocation;

		if(!vm.moments) {
			vm.moments = [];
		}
		if(core.appInitialized === false || 
			vm.moments.length === 0 || 
			core.didUserChangeRadius) {
				vm.moments = [];
				vm.currentLocation = core.currentLocation;
				initialize().then(function() {
					core.appInitialized = true;
				});
		}
		if($stateParams.showErrorBanner === true) {
			$ionicContentBanner.show({
				text: ["An error has occured"],
				type: "error",
				autoClose: 3000
			});
		}

		function keepFindingLocation() {
			var keepFindingLocation = $interval(function() {
				  core.getLocation().then(function() {
					initialize();
					$interval.cancel(keepFindingLocation);
				  }, function(error) {

				  });
			}, 1000);
		};

		function setCoords() {
			vm.touchXposition = event.gesture.center.pageX;
		};

		function dragRight() {
			vm.moments[0].swipedRight = true;
			vm.moments[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.moments[0].swipedLeft = true;
			vm.moments[0].swipedRight = false;
		};

		function release(event) {
			var threshold = constants.HOW_FAR_USER_MUST_DRAG * $window.innerWidth;
			var releasedXposition = event.gesture.center.pageX;
			var distDragged = releasedXposition - vm.touchXposition;
			if(Math.abs(distDragged) > threshold) {
				if(distDragged > 0) {
					vm.liked(true);
				}
				else {
					vm.liked(false);
				}
			}
			else {
				vm.moments[0].swipedRight = false;
				vm.moments[0].swipedLeft = false;
			}
		};		

		function initialize() { 
			vm.loadingMoments = true;
				return momentsService.initializeView()
				.then(function(moments){
					vm.loadingMoments = false;
					vm.moments = moments;
					components.hideLoader();
				}, function(error) {
					vm.loadingMoments = false;
					console.log("ERRROR initialize");
					console.log(core.locationNotFound);
					if(core.locationNotFound) {
						$ionicContentBanner.show({
							text: [constants.LOCATION_NOT_FOUND_TXT],
							type: "error",
							autoClose: 3000
						});
					}
					components.hideLoader()
					// .then(function() {
					// 	$ionicContentBanner.show({
					// 		text: ["An error occured getting the Moment."],
					// 		type: "error",
					// 		autoClose: 3000
					// 	});
					// });
				}); //End of initializeView
		};

		function liked(liked) {
			momentsService.momentArray = vm.moments; //Moment Array in the service does not update the likes for some reason
			sendReport().then(function() {
				if(vm.moments.length === 1) {
					vm.loadingMoments = true;
				}
				momentsService.updateMoment(liked).then(function(moments) {
					vm.loadingMoments = false;
						vm.moments = moments;
						vm.flagClass = "ion-ios-flag-outline";
				}, function(error) {
					vm.loadingMoments = false;
					vm.moments.splice(0,1);
					console.log("ERROR MOMENTS");
					console.log(vm.moments);
					components.hideLoader().then(function() {
						$ionicContentBanner.show({
							text: [constants.LOCATION_NOT_FOUND_TXT],
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