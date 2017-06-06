(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', 'constants', 'awsServices', bestMomentsService]);

	function bestMomentsService(core, $q, constants, awsServices){
		this.momentArray = JSON.parse(localStorage.getItem('bestMoments'));
		var initiateMoments = initiateMoments;
		this.initializeView = initializeView;
		this.loadMore = loadMore;

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function initializeView() {
			var deferred = $q.defer();
			if(this.momentArray) {
				initiateMoments()
				.then(function(moments) {
					this.momentArray.push(moments);
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

		function createPromiseObjects(moments) {
			var promises = [];
			for(var i = 0; i < moments.length; i++) {
				promises.push(awsServices.getMomentMetaData(moments[i].Key).then(function(metaData){
					return {
						key: metaData.key, 
						description: metaData.description,
						likes: parseInt(metaData.likes),
						location: metaData.location,
						time: core.timeElapsed(metaData.time),
						uuids: metaData.uuids,
						views: metaData.views
					};
				}));
			}
			return promises;
		};

		function initiateMoments() {
			var metaData;
			var promises = [];
			this.momentArray = [];
			return awsServices.getMoments(constants.BEST_MOMENT_PREFIX, '').then(function(moments) {
				promises = createPromiseObjects(moments);
				return Promise.all(promises);
			}, function(error) {
				console.log("ERROR");
				console.log(error);
			});
		};

		function loadMore() {
			console.log(JSON.stringify(this.momentArray));
			if(this.momentArray.length > 0) {
				var startAfter = this.momentArray[this.momentArray.length - 1].key;
				startAfter = startAfter.split('/');
				startAfter = startAfter[startAfter.length - 1];
				startAfter = "bestMoments/" + startAfter;
				return awsServices.getMoments(constants.BEST_MOMENT_PREFIX, startAfter).then(function(moments) {
					promises = createPromiseObjects(moments);
					return Promise.all(promises);
				}, function(error) {
					console.log("ERROR");
					console.log(error);
				});
			} else {
				return Promise.resolve([]);
			}
		};

	}})();