angular.module('app.momentsCtrl', [])

.controller('momentsCtrl', ['$scope', '$stateParams', 'coreSvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, coreSvc) {
	$scope.currentImage = 'img/food.jpg';
	$scope.likes = 3;
	$scope.location = 'Narberth, PA';
	$scope.time = '12:04pm';

	$scope.screenWidth = window.screen.width * 0.9;
	$scope.screenHeight = window.screen.height;

	var imageUrl = 'https://s3.amazonaws.com/';
	var imageArray = [];
	var likes = [3, 5, 12];
	var location = ['Narberth, PA', 'Pittsburgh, PA', 'Cherry Hill, NJ'];
	var time = ['12:04pm', '8:01am', '7:02pm'];
	var counter = 0;
	
	var s3 = coreSvc.initiateBucket();

	$scope.like = function() {
		if(counter + 1 < imageArray.length) {
			counter++;
		}
		else {
			counter = 0;
		}
		$scope.currentImage = imageArray[counter];
		$scope.time = time[counter];	
		$scope.location = location[counter];
		$scope.likes = likes[counter];
	};
	$scope.next = function() {
		if(counter + 1 < imageArray.length) {
			counter++;
		}
		else {
			counter = 0;
		}
		$scope.currentImage = imageArray[counter];	
		$scope.time = time[counter];
		$scope.location = location[counter];	
		$scope.likes = likes[counter];
	};
	$scope.get = function() {
		console.log("Device Location");
		// console.log(coreSvc.getDeviceLocation());
		// console.log(coreSvc.getTownName(40.0103647, -75.2625353))
		var params = {
			Bucket: 'mng-moment',
			Prefix: 'test',
			StartAfter: 'test/'
		// Key: 'AKIAIJTJGHYI2C7CYWDA'
		// Key: 'AKIAIPGPET3QYQFWZSFQ'
	};
	s3.listObjectsV2(params, function(error, data) {
		if (error) {
			console.log("ERROR");
			console.log(error.stack);
		}
		else {
			for(var i = 0; i < data.Contents.length; i++) {
				console.log(i);
				var currentImage = data.Contents[i].Key;
				var params = {
					Bucket: coreSvc.getBucketName(),
					Key: data.Contents[i].Key
				};
				s3.headObject(params, function(error, data) {
					if(error) {
						console.log("ERROR");
						console.log(error.stack);
					}
					else {
						//TODO: We are iterating through a list of pictures and making another call to check the metaData
						//		However, we assume that each object has only one UUID.  
						//		Each object should contain all the UUIDs whose devices have accessed that picture.
						console.log("SUCCESS");
						console.log(data.Metadata.uuids);
						console.log(coreSvc.getUUID());
						if(data.Metadata.uuids == coreSvc.getUUID()) {
							console.log("PUSH");
							imageArray.push(imageUrl + currentImage);
							console.log(imageArray);

						}
					}
				});
			}
			
		}
	})
};
}])
