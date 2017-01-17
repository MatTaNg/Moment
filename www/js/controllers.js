angular.module('app.controllers', [])

.controller('pageCtrl', ['$scope', '$stateParams', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $timeout) {

	$scope.momentPicture = document.getElementById('momentPicture');
	$scope.textOverlay= { foo: "" };

	$scope.camera = function() {
		navigator.camera.getPicture(onSuccess, onFail, 
			{ quality: 50, //Quality of photo 0-100
			destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
			allowEdit: false,	//Allows editing of picture
			targetWidth: 300,
			targetHeight: 300,
			correctOrientation: true
		});

		function onSuccess(imageURI) {
			$scope.momentPicture.src = "data:image/jpeg;base64," + imageURI;
			$scope.$apply();
		}

		function onFail(message) {
			console.log('Failed because: ' + message);
		}
	};

        $scope.createOverlay= function(){

        var canvas = document.getElementById('tempCanvas');
        var context = canvas.getContext('2d');

          var source =  new Image();
          source.src =  $scope.momentPicture.src;
          canvas.width = source.width;
          canvas.height = source.height;

          context.drawImage(source,0,0);

          context.font = "100px impact";
          textWidth = context.measureText($scope.frase).width;

          if (textWidth > canvas.offsetWidth) {
              context.font = "40px impact";
          }
          context.textAlign = 'center';
          context.fillStyle = 'white';

          context.fillText($scope.textOverlay.foo,canvas.width/2,canvas.height*0.8);
            var imgURI = canvas.toDataURL();

          $timeout( function(){
              $scope.momentPicture.src = imgURI;
          }, 200);
        }
}])
