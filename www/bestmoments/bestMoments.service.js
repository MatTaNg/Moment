(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', bestMomentsService]);

	function bestMomentsService(core, $q){
		var imageUrl = 'https://s3.amazonaws.com/' + core.getBucketName() + '/';
		var momentArray = [];
		this.initializeView = initializeView;
		
		function initializeView() {
			var deferred = $q.defer();
			core.initiateMoments(core.getBestMomentPrefix())
			.then(function(moments) {
				deferred.resolve(moments);
			}, function(error) {
				console.log("ERROR");
				console.log(error.stack);
				deferred.reject(error);
			});

			return deferred.promise;	
		}
	};

})();