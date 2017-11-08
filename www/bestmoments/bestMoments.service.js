(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['core', '$q', 'constants', 'localStorageManager', bestMomentsService]);

	function bestMomentsService(core, $q, constants, localStorageManager){
		this.momentArray = localStorageManager.get('bestMoments');
		this.initializeView = initializeView;
		this.loadMore = loadMore;
		this.convertTime = convertTime;

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function convertTime(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].convertedTime = core.timeElapsed(moments[i].time);
			}
			return moments;
		}

		function initializeView() {
			var deferred = $q.defer();
			if(this.momentArray) {
				core.listMoments(constants.BEST_MOMENT_PREFIX, '').then(function(moments) {
					this.momentArray = [];
					this.momentArray.push(moments);
					localStorageManager.set('bestMoments', moments).then(function() {
						deferred.resolve(convertTime(moments));		
					});
				}, function(error) {
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
						media: metaData.media,
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
					return convertTime(moments);
				});
			} else {
				return Promise.resolve([]);
			}
		};

	}})();