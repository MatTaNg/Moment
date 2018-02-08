(function() {
	angular.module('UserLocationController', [])

	.controller('UserLocationController', ['$window', '$q','localStorageManager', 'geolocation', '$rootScope', '$scope', '$ionicPopup', 'components', UserLocationController]);

	function UserLocationController($window, $q, localStorageManager, geolocation, $rootScope, $scope, $ionicPopup, components) {
		var vm = this;
		vm.edit = edit;
		vm.getCurrentLocation = getCurrentLocation;
		vm.editLocation = editLocation;
		vm.userLocation = geolocation.currentLocation.town || "Could not find location";
		vm.watchForLocationChange = watchForLocationChange;
		vm.stopWatchingForLocationChange = stopWatchingForLocationChange;
		vm.watchID;
		vm.locationErrorMsg = false;

		function watchForLocationChange() {
			vm.watchID = navigator.geolocation.watchPosition(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				geolocation.setLocation({lat: lat, lng: lng}).then(function(location) {
					vm.userLocation = location.town;
				});
			}, function(error) {

			});
		};

		function stopWatchingForLocationChange() {
			if(vm.watchID) {
				navigator.geolocation.clearWatch(vm.watchID);
			}
		};

		function getCurrentLocation() {
			components.showLoader().then(function() {
				geolocation.setLocation().then(function(location) {
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
					geolocation.setLocation(vm.customUserLocation).then(function(response) {
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

		function edit(editing) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.customUserLocation" placeholder="City, State OR Zip" value="vm.userLocation" style="width: 90%"> </input>' +
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


	};
}());