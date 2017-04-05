(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', '$ionicLoading', 'constants', bestMomentsService]);

	function bestMomentsService(core, $q, $ionicLoading, constants){
		var momentArray = [];
		var initiateMoments = initiateMoments;
		this.initializeView = initializeView;

		function initializeView() {
			var deferred = $q.defer();
			initiateMoments()
			.then(function(moments) {
				deferred.resolve(moments);
			}, function(error) {
				console.log("ERROR");
				console.log(error.stack);
				deferred.reject(error);
			});

			return deferred.promise;	
		};

		function initiateMoments() {
			momentArray = [];
			var deferred = $q.defer();
			var s3 = core.initiateBucket();
			var metaData;
			var params = {
				Bucket: constants.BUCKET_NAME,
				Prefix: constants.BEST_MOMENT_PREFIX
			};
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			s3.listObjectsV2(params, function(error, data) {
				if (error) {
					console.log("ERROR");
					console.log(error.stack);
					deferred.reject(error);
				}
				else {
					$ionicLoading.hide();
					var tempImageArray = [];
					for(var i = 0; i < data.Contents.length; i++) {
				//Push all images from the DB onto an array.  We filter them later.
				if(i > 0) //The first key listed is always the folder, skip that.
					tempImageArray.push(data.Contents[i].Key);
			}
			for(var x = 0; x < tempImageArray.length; x++) {
				(function(x) {
					var params = {
						Bucket: constants.BUCKET_NAME,
						Key: tempImageArray[x]
					};
					s3.headObject(params, function(error, data) {
						if(error) {
							console.log("ERROR");
							console.log(error.stack);
							deferred.reject(error);
						}
						else {
							var time = core.timeElapsed(data.Metadata.time);
							momentArray.push({ 
								key: constants.IMAGE_URL + tempImageArray[x], 
								description: data.Metadata.description,
								likes: data.Metadata.likes,
								location: data.Metadata.location,
								time: time,
								uuids: data.Metadata.uuids,
								views: data.Metadata.views
							});
							if(momentArray.length === tempImageArray.length) {
								deferred.resolve(momentArray);
							}
						}
					});
				})(x);
			} //End of second for loop
			if(tempImageArray.length === 0)
				deferred.resolve(tempImageArray);
		}
	}); //End of listObjects
return deferred.promise;

};
};

})();