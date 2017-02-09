angular.module('app.momentsCtrl', [])

.controller('momentsCtrl', ['$scope', '$stateParams', 'coreSvc', 'momentsSvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, coreSvc, momentsSvc) {
	$scope.likes = "3";
	$scope.location = 'Narberth, PA';
	$scope.time = '12:04pm';
	$scope.UUIDS = "123";
	$scope.counter = 0;

	$scope.screenWidth = window.screen.width * 0.9;
	$scope.screenHeight = window.screen.height;

	var imageUrl = 'https://s3.amazonaws.com/' + coreSvc.getBucketName() + '/';
	var momentArray = momentsSvc.getMoments();
	$scope.currentImage = imageUrl;
	
	$scope.liked = function(liked) {
		var counter = $scope.counter;

		momentsSvc.updateObject(liked, counter);

		counter = momentsSvc.incrementCounter(counter);
		$scope.currentImage = imageUrl +  momentArray[counter].key;
		$scope.time = momentArray[counter].metaData.time;
		$scope.location = momentArray[counter].metaData.location;
		$scope.likes =  momentArray[counter].metaData.likes;

		$scope.counter = counter;
	};

	//Initiate view
	var s3 = coreSvc.initiateBucket();
	var imageURL;
	var metaData;
	var params = {
		Bucket: 'mng-moment',
		Prefix: 'test',
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
				//Push all images from the DB onto an array.  We filter them later.
				tempImageArray.push(data.Contents[i].Key);
			}
			for(var x = 0; x < tempImageArray.length; x++) {
				(function(x) {
					var params = {
						Bucket: coreSvc.getBucketName(),
						Key: tempImageArray[x]
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
						if(data.Metadata.uuids !== coreSvc.getUUID()) {
							momentsSvc.addMoment(tempImageArray[x], data.Metadata);
							console.log(momentsSvc.getMoments());
						}
						if(x === tempImageArray.length - 1) {
							$scope.currentImage = imageUrl + tempImageArray[x];
							$scope.location = data.Metadata.location;
							$scope.time = data.Metadata.time;
							$scope.likes = data.Metadata.likes;
							$scope.$apply();
						}
					}
				});
				})(x);
			} //End of second for loop
		}
	}); //End of listObjects
}])
