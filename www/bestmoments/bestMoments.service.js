(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', 'constants', 'localStorageManager', bestMomentsService]);

	function bestMomentsService(core, $q, constants, localStorageManager){
		this.momentArray = localStorageManager.get('bestMoments');
		this.initializeView = initializeView;
		this.loadMore = loadMore;

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function initializeView() {
			var deferred = $q.defer();
			if(this.momentArray) {
				core.listMoments(constants.BEST_MOMENT_PREFIX, '').then(function(moments) {
					this.momentArray = [];
					this.momentArray.push(moments);
					localStorageManager.set('bestMoments', moments);
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
				promises.push(core.getMomentMetaData(moments[i]).then(function(metaData){
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

		function loadMore() {
			if(this.momentArray.length > 0) {
				var startAfter = this.momentArray[this.momentArray.length - 1].key;
				startAfter = startAfter.split('/');
				startAfter = startAfter[startAfter.length - 1];
				startAfter = "bestMoments/" + startAfter;
				return core.listMoments(constants.BEST_MOMENT_PREFIX, startAfter).then(function(moments) {
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