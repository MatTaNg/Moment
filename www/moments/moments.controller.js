(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['geolocation', 'downloadManager', '$sce', 'momentsService', '$stateParams', '$ionicContentBanner', 'core', 'components', '$q', '$window', 'constants', '$interval', 'localStorageManager', 'notificationManager', '$timeout', MomentsController]);
	function MomentsController (geolocation, downloadManager, $sce, momentsService, $stateParams, $ionicContentBanner, core, components, $q, $window, constants, $interval, localStorageManager, notificationManager, $timeout) {
		var vm = this;
		vm.moments = localStorageManager.get('moments');
		vm.liked = liked;		
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;
		vm.setCoords = setCoords;
		vm.currentLocation = core.currentLocation;
		vm.keepFindingLocation = keepFindingLocation;
		vm.createVideogularObj = createVideogularObj;
		vm.downloadMoment = downloadMoment;

		vm.cardCSSClass = "layer-hide";
		vm.swipedLeft = false;
		vm.swipedRight = false;
		vm.loadingMoments = false;
		vm.touchXposition = 0;
		vm.initRunning = false;
		vm.showComments = false;
		vm.appStatus = "resume";
		vm.comments = [];
		vm.moment = {};
		
		if(!vm.moments) {
			vm.moments = [];
		}
		if((vm.moments.length === 0 ||
			core.appInitialized === false ||
			core.didUserChangeRadius) &&
			cordova.plugins) {
				vm.loadingMoments = true;
				vm.moments = [];
				momentsService.setMomentArray([]);
				vm.currentLocation = geolocation.currentLocation;
				core.appInitialized = true;
				initialize();
		}
		if($stateParams.showErrorBanner === true) {
			$ionicContentBanner.show({
				text: ["An error has occured"],
				type: "error", 
				autoClose: 3000
			});
		}

		function downloadMoment(moment) {
			downloadManager.downloadToDevice(moment.key).then(function() {
			});
		};

		function createVideogularObj(src) {
			vm.config = {
		        sources: [
		          {src: $sce.trustAsResourceUrl(src), type: "video/mp4"},
		        ],
		        tracks: [
		          {
		            src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
		            kind: "subtitles",
		            srclang: "en",
		            label: "English",
		            default: ""
		          }
		        ],
		        theme: "lib/videogular-themes-default/videogular.css",
		        plugins: {
		          poster: "http://www.videogular.com/assets/images/videogular.png"
		        }
		      };
		};

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
			vm.moments[0].animate = '';
			vm.moments[0].swipedRight = true;
			vm.moments[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.moments[0].animate = '';
			vm.moments[0].swipedLeft = true;
			vm.moments[0].swipedRight = false;
		};

		function release(event) {
			vm.moments[0].animate = 'invisible'
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
			if(vm.initRunning === false) {
				return momentsService.initializeView()
				.then(function(moments){
					if(moments.length > 0) {
						vm.comments = moments[0].comments;
					}
					vm.showCommentSpinner = true;
					vm.loadingMoments = false;
					for(var i = 0; i < moments.length; i++ ) {
						vm.moments.push(moments[i]);
					}
					// vm.moments = vm.moments.concat(moments);
					if(moments.length > 0 && moments[0].media === 'video') {
						createVideogularObj(vm.moments[0].nativeurl);
					}
					momentsService.setMomentArray(vm.moments);
					components.hideLoader();
					vm.moments = momentsService.addExtraClassesandSetTime(vm.moments);
					localStorageManager.set('moments', vm.moments);
					if(momentsService.getStartAfterKey() !== "" && vm.moments.length < constants.MAX_NUM_OF_MOMENTS) {
						vm.loadingMoments = true;
						return initialize();
					}
					else {
						vm.initRunning = false;
					}
				}, function(error) {
					vm.loadingMoments = false;
					initialize(); //Try again
					components.hideLoader()
				}); //End of initializeView
			}
		};

		function liked(liked) {
			momentsService.momentArray = vm.moments; //Moment Array in the service does not update the likes for some reason
			sendReport().then(function() {
				momentsService.updateMoment(liked).then(function() {
					if(vm.moments.length < constants.MAX_NUM_OF_MOMENTS) {
						initialize();
					}
					}, function(error) {
						if(vm.moments.length < constants.MAX_NUM_OF_MOMENTS) {
							initialize();
						}
				});
				if(vm.moments.length === 1) {
					vm.loadingMoments = true;
				}
				vm.moments.splice(0, 1);
				vm.moments = momentsService.addExtraClassesandSetTime(vm.moments);
				if(vm.moments.length > 0 && vm.moments[0].media === 'video') {
					createVideogularObj(vm.moments[0].nativeurl);
				}
				components.hideLoader();
				vm.flagClass = "ion-ios-flag-outline";

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

		document.addEventListener("pause", onPause, false) //Fires when user minimizes the app

		document.addEventListener("resume", onResume, false) //Fires when the user maximizes the app

		function onResume() {
			vm.appStatus = "resume";
		}

		function onPause() {
			vm.appStatus = "pause";
			initialize().then(function() {
				if(vm.moments.length > 0 && vm.initRunning === false) {
		            notificationManager.notifyMoreMomentsFound();
		            $timeout(function() {
		              onPause();
		            }, constants.MILISECONDS_IN_A_DAY); //Only notify once a day
				}
				else {
					$timeout(function() {
						if(vm.appStatus === "pause") {
							onPause();
						}
					}, constants.MILISECONDS_IN_AN_HOUR); //Re-check every hour.
				}
			}, function(error) {
				$timeout(function() {
					onPause();
				}, constants.MILISECONDS_IN_AN_HOUR); //Re-check every hour.
			});
		};
	}
})();