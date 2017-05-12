(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', '$rootScope', 'constants', '$q', '$scope', 'momentsService', '$interval', 'myMomentsService', '$ionicPopup', 'components', '$scope', 'geolocation', MyMomentsController]);
	function MyMomentsController(core, $rootScope, constants, $q, $scope, momentsService, $interval, myMomentsService, $ionicPopup, components, $scope, geolocation) {
		var vm = this;
		vm.initialize = initialize;
		vm.myImages = myMomentsService.momentArray;
		vm.remove = remove;
		vm.feedback = feedback;
		vm.toggleDescription = toggleDescription;
		vm.refreshing = refreshing;
		vm.editLocation = editLocation;
		vm.edit = edit;
		vm.getCurrentLocation = getCurrentLocation;

		vm.totalLikes = 0;
		vm.showShortDescription = true;
		vm.userLocation = "Narberth, PA";
		vm.customUserLocation = "";
		vm.locationErrorMsg = false;
		vm.distance = localStorage.getItem('momentRadiusInMiles');
		// initialize();

		$rootScope.$on("$locationChangeStart", function(event, next, current) {
			if(current.indexOf('myMoments') !== -1) {
				$rootScope.$emit('myMomentLogo', 'ion-ios-person-outline');
				if(vm.distance !== localStorage.getItem('momentRadiusInMiles')) {
					localStorage.setItem('momentRadiusInMiles', vm.distance);
					core.didUserChangeRadius = true;
					geolocation.setMomentInRadius(vm.distance);
				}
			}
			//TODO: Find a better place for this
			else if(next.indexOf('submitMoment') !== -1) {
				$rootScope.$emit('uploadLogo', 'ion-ios-upload');
			}
			else if(current.indexOf('submitMoment') !== -1) {
				$rootScope.$emit('uploadLogo', 'ion-ios-upload-outline');
			}
			//End TODO
		});

		$rootScope.$emit('myMomentLogo', 'ion-ios-person');

		function refreshing() {
			initialize().then(function() {
				$scope.$broadcast('scroll.refreshComplete');
			}, function(error) {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function initialize() {
			var deferred = $q.defer();
			console.log("moments");
			geolocation.initializeUserLocation().then(function(location) {
				vm.userLocation = location.town;
			});
			if(constants.DEV_MODE) {
				core.getHardCodedMoments().then(function(moments) {
					console.log(moments);
					vm.myImages = moments;
					vm.totalLikes = myMomentsService.totalLikes;
					vm.extraLikes = myMomentsService.extraLikes;
					localStorage.setItem('myMoments', JSON.stringify(moments));
					vm.errorMessage = false;
					deferred.resolve();
				});
			} else {
				if(vm.myImages) {
					myMomentsService.initialize(vm.myImages).then(function(moments) {
						vm.refresh = false;
						console.log("MOMENTS");
						console.log(moments);
						vm.myImages = moments;
						vm.totalLikes = myMomentsService.totalLikes;
						vm.extraLikes = myMomentsService.extraLikes;
						localStorage.setItem('myMoments', JSON.stringify(moments));
						vm.errorMessage = false;
						deferred.resolve();
					}, function(error) {
						$ionicContentBanner.show({
							text: ["We apologize; there was a problem getting the moments"],
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
			}
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
						vm.myImages = JSON.parse(localStorage.getItem('myMoments'));

						if(vm.myImages.length === 0) {
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
			geolocation.initializeUserLocation().then(function(location) {
				vm.userLocation = location.town;
			});
		};

		function edit(editing) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.customUserLocation" style="width:90%;"> </input>' +
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
					geolocation.getLocationFromTown(vm.customUserLocation).then(function(response) {
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
							components.hideLoader();
							deferred.reject();
						});
			}, function(error) {	//Town DNE
				console.log("ERROR");
				vm.locationErrorMsg = true;
				deferred.reject();
				components.hideLoader();
			});
				})

			}
			else {
				vm.locationErrorMsg = true;
				deferred.reject();
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
};
}());