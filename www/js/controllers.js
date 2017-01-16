angular.module('app.controllers', [])

.controller('pageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

	$scope.camera = function() {
		navigator.camera.getPicture(onSuccess, onFail, 
			{ quality: 50, //Quality of photo 0-100
			destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
			allowEdit: false	//Allows editing of picture
			 });

		function onSuccess(imageURI) {
			var image = document.getElementById('momentPicture');
			image.src = "data:image/jpeg;base64," + imageURI;
			console.log(image.src);
			$scope.$apply();
		}

		function onFail(message) {
			console.log('Failed because: ' + message);
		}
	};

}])
