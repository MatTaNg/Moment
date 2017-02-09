angular.module('app.textOverlayCtrl', [])
  
.controller('textOverlayCtrl', ['$scope', '$stateParams', '$state', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $timeout) {
	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	var momentPicture;
	$scope.textOverlay= { foo: "" };

	(function init() {
		$scope.momentPicture = $stateParams.picture;
		momentPicture = $scope.momentPicture;
		console.log("Screen");
		console.log(screenHeight);
		console.log(screenWidth);
	})();

	$scope.back = function() {
		console.log("Back");
		$state.go('tabsController.camera');
	};

 	$scope.createOverlay= function(){

        // var canvas = document.getElementById('tempCanvas');
        // var context = canvas.getContext('2d');

        //   var source =  new Image();
        //   source.src =  momentPicture;
        //   canvas.width = source.width;
        //   canvas.height = source.height;

        //   console.log("Width");
        //   console.log(canvas.width);
        //   console.log("Height");
        //   console.log(canvas.height);

        //   context.drawImage(source,0,0);

        //   context.font = "100px impact";
        //   textWidth = context.measureText($scope.frase).width;

        //   if (textWidth > canvas.offsetWidth) {
        //       context.font = "40px impact";
        //   }
        //   context.textAlign = 'center';
        //   context.fillStyle = 'white';

        //   context.fillText($scope.textOverlay.foo,canvas.width/2,canvas.height*0.8);
        //     var imgURI = canvas.toDataURL();

        //   $timeout( function(){
        //       $scope.momentPicture = imgURI;
        //       context.clearRect(0, 0, canvas.width, canvas.height);
        //   }, 200);
        }
}])