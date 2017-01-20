angular.module('app.cameraCtrl', [])
   
.controller('cameraCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state) {

	$scope.momentPicture = document.getElementById('momentPicture');

	$scope.camera = function() {
		console.log("CAMERA");
		navigator.camera.getPicture(onSuccess, onFail, 
			{ quality: 50, //Quality of photo 0-100
			destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
			allowEdit: false,	//Allows editing of picture
			targetWidth: 300,
			targetHeight: 300,
			correctOrientation: true
		});

		function onSuccess(imageURI) {
			var picture = "data:image/jpeg;base64," + imageURI;
			$scope.momentPicture = document.getElementById('momentPicture');
			$scope.momentPicture.src = picture;
			$state.go('textOverlay', {'picture': imageURI});
		}

		function onFail(message) {
			console.log('Failed because: ' + message);
		}
	};
}])
    