angular.module('app.momentListCtrl', [])
   
.controller('momentListCtrl', ['$scope', '$stateParams', 'coreSvc', 'momentListSvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, coreSvc, momentListSvc) {
	console.log("SADSA");
	$scope.currentImage = ['img/food.jpg', 'img/landscape.jpg', 'img/selfie.jpg'];
	$scope.likes = [3, 5, 12];
	$scope.location = ['Narberth, PA', 'Pittsburgh, PA', 'Cherry Hill, NJ'];
	$scope.time = ['12:04pm', '8:01am', '7:02pm'];

	$scope.screenWidth = window.screen.width * 0.9;
	$scope.screenHeight = window.screen.height;
	
	$scope.imageArray = ['img/food.jpg', 'img/landscape.jpg', 'img/selfie.jpg'];
	var imageUrl = 'https://s3.amazonaws.com/' + coreSvc.getBucketName() + '/';
	var likes = [3, 5, 12];
	var location = ['Narberth, PA', 'Pittsburgh, PA', 'Cherry Hill, NJ'];
	var time = ['12:04pm', '8:01am', '7:02pm'];
	var counter = 0;



	//Initiate view
	var s3 = coreSvc.initiateBucket();
	var imageURL;
	var metaData;
	var params = {
		Bucket: 'mng-moment',
		Prefix: 'test',
		MaxKeys: 50,
		StartAfter: 'test/'
	};
	s3.listObjectsV2(params, function(error, data) {
		if (error) {
			console.log("ERROR");
			console.log(error.stack);
		}
		else {
			var tempImageArray = [];
			for(var i = 0; i < data.Contents.length; i++) {
				console.log(data.Contents[i]);
				//Push all images from the DB onto an array.  We filter them later.
				tempImageArray.push(data.Contents[i].Key);
			}
			for(var x = 0; x < tempImageArray.length; x++) {
				(function(x) {
					var params = {
						Bucket: coreSvc.getBucketName(),
						Key: tempImageArray[x]
					};
					console.log("PARAMS");
					console.log(params);
					s3.headObject(params, function(error, data) {
						if(error) {
							console.log("ERROR");
							console.log(error.stack);
						}
						else {
						//TODO: We are iterating through a list of pictures and making another call to check the metaData
						//		However, we assume that each object has only one UUID.  
						//		Each object should contain all the UUIDs whose devices have accessed that picture.
							momentListSvc.addMoment(tempImageArray[x], data.Metadata);

							$scope.imageArray.push(tempImageArray[x]);
							$scope.currentImage = imageUrl + $scope.imageArray[0];
							console.log($scope.currentImage);
						if(x === tempImageArray.length - 1) {
							$scope.$apply();
						}
					}
				});
				})(x);
			} //End of second for loop
		}
	}); //End of listObjects
}])