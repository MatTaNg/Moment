(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', 'constants', '$q', '$scope', 'momentsService', '$interval', 'myMomentsService', '$ionicPopup', 'components', '$scope', 'geolocation', MyMomentsController]);
	function MyMomentsController(core, constants, $q, $scope, momentsService, $interval, myMomentsService, $ionicPopup, components, $scope, geolocation) {
		var vm = this;
		vm.myImages = JSON.parse(localStorage.getItem('myMoments'));
		vm.totalLikes = 0;
		vm.oldLikes = 0;
		vm.remove = remove;
		vm.feedback = feedback;
		vm.showShortDescription = true;
		vm.toggleDescription = toggleDescription;
		vm.initialize = initialize;
		vm.userLocation = "Narberth, PA";
		vm.customUserLocation = "";
		vm.refresh = refresh;
		vm.editLocation = editLocation;
		vm.edit = edit;
		vm.locationErrorMsg = false;
		vm.getCurrentLocation = getCurrentLocation;

		vm.distance = localStorage.getItem('momentRadiusInMiles');
		initialize();

		$scope.$on("$locationChangeStart", function(event, next, current) { 
			if(current.indexOf("myMoments") !== -1 && vm.distance !== localStorage.getItem('momentRadiusInMiles')) {
				localStorage.setItem('momentRadiusInMiles', vm.distance);
				core.didUserChangeRadius = true;
				geolocation.setMomentInRadius(vm.distance);
			}
		});

		function getCurrentLocation() {
			geolocation.initializeUserLocation().then(function(location) {
				vm.userLocation = location.town;
			});
		};

		function edit(editing) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.customUserLocation"> </input>' +
							'<span style="font-size: 14px" ng-click="vm.getCurrentLocation()">Get Current Location</span>' +
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

		function refresh() {
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
			});
			if(constants.DEV_MODE) {
				core.getHardCodedMoments().then(function(moments) {
					vm.refresh = false;
					vm.myImages = moments;
					setOldLikes();
					for(var i = 0; i < vm.myImages.length; i++) {
						vm.totalLikes = vm.totalLikes + parseInt(vm.myImages[i].likes);
						vm.myImages[i].time = core.timeElapsed(vm.myImages[i].time);
						vm.myImages[i].description = "This text is 60 characters long This text is 60 characters l This text is 60 characters long This text is 60 characters l This text is 60 characters long This text is 60 characters l";
						if(vm.myImages[i].description.length > 0) {
							vm.myImages[i].shortDescription = vm.myImages[i].description.substring(0,50);
							vm.myImages[i].showShortDescription = true;
						}
					}
					calculateNumberOfExtraLikes();
					vm.errorMessage = false;
					deferred.resolve();
				});
			} else {
				if(vm.myImages) {
					components.showLoader()
					.then(function() {
						setOldLikes();
						myMomentsService.initialize(vm.myImages).then(function(moments) {
							vm.refresh = false;
							components.hideLoader().then(function() {
								localStorage.setItem('myMoments', JSON.stringify(moments));
								calculateNumberOfExtraLikes();
								vm.errorMessage = false;
								deferred.resolve();
							});
						}, function(error) {
							$ionicContentBanner.show({
								text: ["We apologize; there was a problem getting the moments"],
								type: "error",
								autoClose: 3000
							});
							deferred.reject();
						});
					});
				}
				else {
					vm.errorMessage = true;
					deferred.reject();
				}
			}
			return deferred.promise;
		};

		function setOldLikes() {
			for(var i = 0; i < vm.myImages.length; i++){
				vm.oldLikes = vm.oldLikes + parseInt(vm.myImages[i].likes);
			}
		};

		function calculateNumberOfExtraLikes() {
			vm.numberOfExtraLikes = vm.totalLikes - vm.oldLikes;
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
})();