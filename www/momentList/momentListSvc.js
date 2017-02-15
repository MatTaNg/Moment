angular.module('app.momentListSvc', [])

.factory('BlankFactory', [function(){

}])

.service('momentListSvc', ['coreSvc', '$q', function(coreSvc, $q){
	var imageUrl = 'https://s3.amazonaws.com/' + coreSvc.getBucketName() + '/';
	var momentArray = [];

	this.initializeView = function() {
		var deferred = $q.defer();
		coreSvc.initiateMoments(coreSvc.getBestMomentPrefix())
		.then(function(moments) {
			deferred.resolve(moments);
		}, function(error) {
			console.log("ERROR");
			console.log(error.stack);
			deferred.reject(error);
		});

		return deferred.promise;	
	}
}]);