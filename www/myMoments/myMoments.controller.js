(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', '$rootScope', 'constants', '$q', 'momentsService', 'myMomentsService', '$ionicPopup', 'components', '$scope', 'geolocation', MyMomentsController]);
	function MyMomentsController(core, $rootScope, constants, $q, momentsService, myMomentsService, $ionicPopup, components, $scope, geolocation) {
		var vm = this;
		vm.initialize = initialize;
		vm.moments = JSON.parse(localStorage.getItem('myMoments'));
		vm.remove = remove;
		vm.feedback = feedback;
		vm.toggleDescription = toggleDescription;
		vm.refreshing = refreshing;
		vm.editLocation = editLocation;
		vm.edit = edit;
		vm.getCurrentLocation = getCurrentLocation;
		vm.getLocationFromZipCode = getLocationFromZipCode;

		vm.totalLikes = 0;
		vm.showShortDescription = true;
		vm.userLocation = "Narberth, PA";
		vm.customUserLocation = "";
		vm.locationErrorMsg = false;
		vm.distance = localStorage.getItem('momentRadiusInMiles');

		if(!(vm.moments)) {
			vm.moments = [];
		}

		initialize();

		$rootScope.$on("$locationChangeStart", function(event, next, current) {
			if(current.indexOf('myMoments') !== -1) {
				if(vm.distance !== localStorage.getItem('momentRadiusInMiles')) {
					localStorage.setItem('momentRadiusInMiles', vm.distance);
					geolocation.setMomentInRadius(vm.distance);
				}
			}
		});

		$scope.$watch('vm.distance', function() {
			if(vm.distance !== localStorage.getItem('momentRadiusInMiles')) {
				core.didUserChangeRadius = true;
			}
		});

		function refreshing() {
			initialize().then(function() {
				$scope.$broadcast('scroll.refreshComplete');
			}, function(error) {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function initialize() {
			var deferred = $q.defer();
			geolocation.initializeUserLocation().then(function(location) {
				vm.userLocation = location.town;
			if(vm.moments !== []) {
				myMomentsService.initialize(vm.moments).then(function(moments) {
					for(var i = 0; i < moments.length;){ //initialize returns a null object if it cannot find it.  Remove it
						if(!moments[i]) {
							moments.splice(i, 1);
						} else {
							i++;
						}
					}
					if(moments !== null) {
						vm.refresh = false;
						vm.moments = moments;
						vm.totalLikes = myMomentsService.getTotalLikes();
						vm.extraLikes = myMomentsService.getExtraLikes();
						localStorage.setItem('myMoments', JSON.stringify(moments));
						vm.errorMessage = false;
					} else {
						vm.moments = [];
					}
					deferred.resolve();
				}, function(error) {
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
			});
			return deferred.promise;
		};

		function remove(moment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					core.remove(moment).then(function() {
						myMomentsService.removeFromLocalStorage(moment);
						vm.moments = JSON.parse(localStorage.getItem('myMoments'));

						if(vm.moments.length === 0) {
							vm.errorMessage = true;
						}	
					}, function(error) {
						console.log("REMOVE FAILED");
						console.log(error);
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
			geolocation.customLocation.town = false;
			geolocation.initializeUserLocation().then(function(location) {
				vm.customUserLocation = location.town;
			});
		};

		function edit(editing) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.customUserLocation" value="vm.userLocation" style="width:90%;"> </input>' +
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
								editLocation().then(function() {
									console.log("POPUP CLOSE");
									popUp.close()
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
					if(isNaN(vm.customUserLocation) === false) { //If it is a number...
						getLocationFromZipCode().then(function() {
							components.hideLoader().then(function() {
								console.log("GET LOCATION FROM ZIP CODE");
								deferred.resolve();
							});
						}, function(error) {
							components.hideLoader().then(function() {
								console.log("ERROR LOCATION FROM ZIP CODE");
								deferred.reject();
							});
						});
					} else {
						getLocationFromTownName().then(function() {
							components.hideLoader().then(function() {
								console.log("GET LOCATION FROM TOWN NAME");
								deferred.resolve();
							});
						}, function(error) {
							components.hideLoader().then(function() {
								console.log("ERROR LOCATION FROM TOWN NAME");
								deferred.reject();
							});
						});
					}
				})

			}
			else {
				components.hideLoader().then(function() {
					console.log("ERROR");
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
				'<ion-checkbox ng-model="vm.moment.isBug">Is this a bug?</ion-checkbox> {{vm.moment.feedback}}',
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
								myMomentsService.uploadFeedback(vm.moment.feedback, vm.moment.isBug).then(function() {
									$ionicPopup.alert({
										title: '<b>Thank you for your feedback!</b>',
										template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
									});
								}, function(error) {
									$ionicPopup.alert({
										title: '<b>Something went wrong.  Sorry, our fault!</b>',
										template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
									});
								});

							};
						}
						
					}
					]
				});
		};

		function getLocationFromTownName() {
			return geolocation.getCoordinatesFromTown(vm.customUserLocation).then(function(response) {
				geolocation.customLocation = { lat: response.lat, lng: response.lng, town: response.town };
				return momentsService.initializeView().then(function(moments) {
					return components.hideLoader().then(function() {
						localStorage.setItem('moments', JSON.stringify(moments));
						vm.userLocation = response.town;
						vm.customUserLocation = "";
						vm.locationErrorMsg = false;
						// deferred.resolve();
					})
				}, function(error) {
					components.hideLoader();
					// deferred.reject();
				});
			}, function(error) {	//Town DNE
				console.log("ERROR");
				vm.locationErrorMsg = true;
				components.hideLoader();
				// deferred.reject();
			});
		};

		function getLocationFromZipCode() {
			var deferred = $q.defer();
			geolocation.getCoordsFromZipCode(vm.customUserLocation).then(function(response) {
				geolocation.customLocation = { lat: response.lat, lng: response.lng, town: response.town };
						momentsService.initializeView().then(function(moments) {
							components.hideLoader().then(function() {
							localStorage.setItem('moments', JSON.stringify(moments));
							vm.userLocation = response.town;
							vm.customUserLocation = "";
							vm.locationErrorMsg = false;
							deferred.resolve();
						})
					}, function(error) {
						deferred.reject();
					});
			}, function(error) {
				console.log("ERROR");
				vm.locationErrorMsg = true;
				deferred.reject();
			});
			return deferred.promise;
		};
};
}());