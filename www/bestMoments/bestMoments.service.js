(function() {
	angular.module('app.bestMomentsService', [])

	.service('bestMomentsService', ['common', 'core', '$q', 'constants', 'commentManager', 'localStorageManager', bestMomentsService]);

	function bestMomentsService(common, core, $q, constants, commentManager, localStorageManager){
		localStorageManager.getAndDownload('bestMoments').then(function(moments) {
			this.momentArray = moments;
		});
		this.initializeView = initializeView;
		this.loadMore = loadMore;
		this.convertTime = convertTime;
		this.getComments = getComments;

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function convertTime(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].convertedTime = common.timeElapsed(moments[i].time);
			}
			return moments;
		};

		function getComments(moments) {
			return commentManager.retrieveCommentsAndAddToMoments(moments);
		};

		function initializeView() {
			var deferred = $q.defer();
			if(this.momentArray) {
				core.listMoments(constants.BEST_MOMENT_PREFIX, '').then(function(moments) {
					this.momentArray = [];
					this.momentArray.push(moments);
					moments = convertTime(moments);
					getComments(moments).then(function (momentsWithComments) {
						localStorageManager.set('bestMoments', moments).then(function() {
							console.log("BEST MOMENT INIT FINISHED");	
							deferred.resolve(convertTime(moments));
						});
					});
				}, function(error) {
					deferred.reject(error);
				});
			}
			else {
				deferred.resolve([]);
			}
			return deferred.promise;	
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