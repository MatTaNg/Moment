angular.module('app.momentsCtrl', [])

.controller('momentsCtrl', ['$scope', '$stateParams', '$cordovaGeolocation', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $cordovaGeolocation) {
		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions)
		.then(function(position) {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			console.log("latitude");
			console.log(latitude);
			console.log("longitude");
			console.log(longitude);
			alert(latitude);
		}, function(error) {
			console.log("ERROR");
			console.log(error.message);
		});

}])
