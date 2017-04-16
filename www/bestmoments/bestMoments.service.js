(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', '$ionicLoading', 'constants', 'awsServices', bestMomentsService]);

	function bestMomentsService(core, $q, $ionicLoading, constants, awsServices){
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
				console.log(error);
				deferred.reject(error);
			});

			return deferred.promise;	
		};

		function initiateMoments() {
			var metaData;
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			momentArray = [];
			var deferred = $q.defer();
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX).then(function(moments) {
				var tempImageArray = [];
				console.log("MOMENTS");
				console.log(moments);
				for(var i = 0; i < moments.length; i++) {
				//Push all images from the DB onto an array.  We filter them later.
				if(i > 0) //The first key listed is always the folder, skip that.
					tempImageArray.push(moments[i].Key);
				}
			for(var x = 0; x < tempImageArray.length; x++) {
				(function(x) {
					awsServices.getMomentMetaData(constants.BEST_MOMENT_PREFIX).then(function(metaData) {
						console.log(metaData);
						var time = core.timeElapsed(metaData.time);
						momentArray.push({ 
							key: constants.IMAGE_URL + tempImageArray[x], 
							description: metaData.description,
							likes: metaData.likes,
							location: metaData.location,
							time: time,
							uuids: metaData.uuids,
							views: metaData.views
						});
						if(momentArray.length === tempImageArray.length) {
							$ionicLoading.hide().then(function() {
								deferred.resolve(momentArray);			
							});

						}
					}, function(error) {
						console.log("ERROR - bestMoments.getMomentMetaData");
						console.log(error);
						deferred.reject(error);
					});
				})(x);
			} //End of second for loop
		}, function(error) {
			console.log("ERROR - bestMoments.getMoments");
			console.log(error);
			deferred.reject(error);
		});
return deferred.promise;
};

}})();