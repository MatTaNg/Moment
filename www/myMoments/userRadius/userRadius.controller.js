(function() {
	angular.module('UserRadiusController', [])

	.controller('UserRadiusController', ['$scope', '$rootScope', 'localStorageManager', 'geolocation', UserRadiusController]);

	function UserRadiusController($scope, $rootScope, localStorageManager, geolocation) {
		var vm = this;
		vm.distance = localStorageManager.get('momentRadiusInMiles');
		vm.watchingForLocationChange = true;

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
				geolocation.didUserChangeRadius = true;
			}
		});
	};
}());