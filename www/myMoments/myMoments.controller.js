(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['$ionicLoading', '$sce','core', '$rootScope', 'constants', '$q', 'myMomentsService', '$ionicPopup', 'components', '$scope', 'geolocation', '$ionicContentBanner', 'localStorageManager', MyMomentsController]);
	function MyMomentsController($ionicLoading, $sce, core, $rootScope, constants, $q, myMomentsService, $ionicPopup, components, $scope, geolocation, $ionicContentBanner, localStorageManager) {
		var vm = this;
		vm.initialize = initialize;
		vm.moments = localStorageManager.get('myMoments');
		vm.remove = remove;
		vm.feedback = feedback;
		vm.toggleDescription = toggleDescription;
		vm.refreshing = refreshing;
		vm.edit = edit;
		vm.getCurrentLocation = getCurrentLocation;
		vm.editLocation = editLocation;
		vm.watchForLocationChange = watchForLocationChange;
		vm.stopWatchingForLocationChange = stopWatchingForLocationChange;
		vm.createVideogularObj = createVideogularObj;

		vm.userLocation = core.currentLocation.town || "Could not find location";
		vm.totalLikes = localStorageManager.get('totalLikes');
		vm.showShortDescription = true;
		vm.locationErrorMsg = false;
		vm.distance = localStorageManager.get('momentRadiusInMiles');
		vm.watchingForLocationChange = true;
		vm.loading = false;
		vm.watchID;
		vm.initRunning = false;

		if(!(vm.moments)) {
			vm.moments = [];
		}

		initialize();
		if(vm.customUserLocation) {
			watchForLocationChange();	
		}
		

		function stopWatchingForLocationChange() {
			if(vm.watchID) {
				navigator.geolocation.clearWatch(vm.watchID);
			}
		};

		function watchForLocationChange() {
			vm.watchID = navigator.geolocation.watchPosition(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				geolocation.getLocationFromCoords(lat, lng).then(function(location) {
					vm.userLocation = location.town;
				});
			}, function(error) {

			});
		};

		$rootScope.$on("$locationChangeStart", function(event, next, current) {
			if(current.indexOf('myMoments') !== -1) {
				if(vm.distance !== localStorage.getItem('momentRadiusInMiles')) {
					localStorage.setItem('momentRadiusInMiles', vm.distance);
					geolocation.setMomentInRadius(vm.distance);
				}
			}
		});

		$scope.$watch('vm.distance', function() {
			if(JSON.stringify(vm.distance) !== JSON.stringify(localStorageManager.get('momentRadiusInMiles'))) {
				core.didUserChangeRadius = true;
			}
		});


		function createVideogularObj(moments) {
			var sources_array = [];
			for(var i = 0; i < moments.length; i++) {
				if(moments[i].media === "video") {
					sources_array.push( {src: $sce.trustAsResourceUrl(moments[i].nativeURL), type: "video/mp4"} );
				}
			}
			vm.config = {
		        sources: sources_array,
		        preload: "preload",
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

		function refreshing() {
			initialize().then(function() {
				$scope.$broadcast('scroll.refreshComplete');
			}, function(error) {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function removeNullObject(moments) {
			for(var i = 0; i < moments.length;){ //initialize returns a null object if it cannot find it.  Remove it
				if(!moments[i]) {
					moments.splice(i, 1);
				} else {
					i++;
				}
			}
			return moments;
		};

		function initialize() {
			if(!geolocation.customUserLocation) {
				core.getLocation();
			}
			if(vm.moments.length === 0){
				vm.loading = true;
			}
			else {
				for(var i = 0; i < vm.moments.length; i++ ){
					vm.moments[i].time = core.timeElapsed(vm.moments[i].time);
				}
				createVideogularObj(vm.moments);
			}
			var deferred = $q.defer();
			if(vm.moments !== [] && vm.initRunning === false) {
				vm.initRunning = true;
				myMomentsService.initialize().then(function(moments) {
					vm.initRunning = false;
					moments = removeNullObject(moments); //Band-aid
					if(moments !== null && moments.length > 0) {
						vm.refresh = false;
						vm.moments = moments;
						vm.totalLikes = myMomentsService.getTotalLikes();
						vm.extraLikes = myMomentsService.getExtraLikes();
						vm.loading = false;
						createVideogularObj(moments);
						vm.errorMessage = false;
					} else {
						vm.moments = [];
					}
					deferred.resolve();
				}, function(error) {
					vm.initRunning = false;
					$ionicContentBanner.show({
						text: ["There was a problem getting the moments"],
						type: "error",
						autoClose: 3000
					});
					deferred.reject();
				});
			}
			else {
				vm.errorMessage = true;
				deferred.reject();
			}
			return deferred.promise;
		};

		function remove(moment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					$ionicLoading.show({}).then(function() {
						var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
						var bestMomentKey = moment.key.replace(/\/moment\/../, "/bestMoments");
						core.remove(moment).then(function() {
							moment.key = bestMomentKey
							core.remove(moment).then(function() {
								myMomentsService.removeFromLocalStorage(moment);
								vm.moments.splice(vm.moments.indexOf(moment), 1);
								$ionicLoading.hide();
								if(vm.moments.length === 0) {
									vm.errorMessage = true;
								}	
							}, function(error) {
								$ionicLoading.hide();
							});
						}, function(error) {
							$ionicLoading.hide();
						});

					});
				}
				else{
					console.log("!CONFIRM");
				}
			});
		};

		function toggleDescription(image) {
			if(image.showShortDescription) {
				image.showShortDescription = false;
			} else {
				image.showShortDescription = true;
			}
		};

		function getCurrentLocation() {
			components.showLoader().then(function() {
				core.getLocation().then(function(location) {
					vm.watchingForLocationChange = location.town;
					vm.customUserLocation = location.town;
					components.hideLoader();
				}, function(error) {
					components.hideLoader();
					$ionicContentBanner.show({
						text: [constants.LOCATION_NOT_FOUND_TXT],
						type: "error",
						autoClose: 3000
					})
				});
			})
		};

		function edit(editing) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.customUserLocation" placeholder="City, State OR Zip" value="vm.userLocation" style="width:90%;"> </input>' +
				'<span ng-click="vm.getCurrentLocation()" class="ion-location" style="margin-left: 5px; font-size: 25px"></span>' +
				'<span style="color: red; font-size:12px" ng-if="vm.locationErrorMsg">We could not find this location</span>',
				title: 'Location',
				scope: $scope,
				buttons: [ 
				{ text: 'Cancel' },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!vm.customUserLocation) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								e.preventDefault();
								vm.editLocation(vm.customUserLocation).then(function() {
									popUp.close();
								}, function(error) {
									e.preventDefault();
								});
							};
						}
						
					}
					]
				});
		};

		function editLocation() {
			var deferred = $q.defer();
			if(vm.customUserLocation.length > 3) {
				components.showLoader()
				.then(function() {
					if(vm.watchingForLocationChange === vm.customUserLocation) {
						watchForLocationChange();						
					}
					else {
						stopWatchingForLocationChange();
					}
					core.getLocation(vm.customUserLocation).then(function(response) {
						components.hideLoader().then(function() {
							vm.userLocation = response.town;
							vm.customUserLocation = "";
							vm.locationErrorMsg = false;
							deferred.resolve();
						});
					}, function(error) {
						components.hideLoader().then(function() {
							vm.locationErrorMsg = true;
							deferred.reject();
						});
					});	
				})

			}
			else {
				components.hideLoader().then(function() {
					vm.locationErrorMsg = true;
					deferred.reject();
				});
			}
			return deferred.promise;
		};

		function feedback() {
			$scope.moment = {};

			$ionicPopup.show({
				template: '<textarea ng-model="vm.moment.feedback" style="height: 100px; margin-bottom: 10px"> </textarea>' + 
				'<ion-checkbox ng-model="vm.moment.isBug">Is this a bug?</ion-checkbox>',
				title: 'Feedback',
				scope: $scope,
				subTitle: 'How can we improve?',
				buttons: [ 
				{ text: 'Cancel' },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!vm.moment.feedback) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								components.showLoader().then(function() {
									myMomentsService.uploadFeedback(vm.moment.feedback, vm.moment.isBug).then(function() {
										components.hideLoader();
										$ionicPopup.alert({
											title: '<b>Thank you for your feedback!</b>',
											template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
										});
									}, function(error) {
										components.hideLoader();
										$ionicPopup.alert({
											title: '<b>Something went wrong.  Sorry, our fault!</b>',
											template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
										});
									});
								});

							};
						}
						
					}
					]
				});
		};

};
}());