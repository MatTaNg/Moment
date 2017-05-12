(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', 'constants', 'awsServices', bestMomentsService]);

	function bestMomentsService(core, $q, constants, awsServices){
		this.momentArray = JSON.parse(localStorage.getItem('bestMoments'));
		var initiateMoments = initiateMoments;
		this.initializeView = initializeView;

		function initializeView() {
			var deferred = $q.defer();
			if(this.momentArray.length === 0) {
				initiateMoments()
				.then(function(moments) {
					this.momentArray.push({ moments });
					localStorage.setItem('bestMoments', JSON.stringify(moments));
					deferred.resolve(moments);		
				}, function(error) {
					console.log("ERROR");
					deferred.reject(error);
				});
			}
			else {
				deferred.resolve();
			}
			return deferred.promise;	
		};

		function initiateMoments() {
			var deferred = $q.defer();
			var metaData;
			this.momentArray = [];
			var deferred = $q.defer();
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX).then(function(moments) {
				moments.splice(0,1); //The first key listed is always the folder, skip that.
				deferred.resolve(Promise.all(moments.map(moment => 
					awsServices.getMomentMetaData(moment.Key).then(metaData => ({
						key: constants.IMAGE_URL + moment.Key, 
						description: metaData.description,
						likes: metaData.likes,
						location: metaData.location,
						time: core.timeElapsed(metaData.time),
						uuids: metaData.uuids,
						views: metaData.views,
						src: constants.IMAGE_URL + moment.Key, //For the gallery directive
						sub: metaData.description
					}))
					)));
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};

	}})();