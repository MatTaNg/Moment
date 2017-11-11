(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['downloadManager','core', '$q', 'logger', 'localStorageManager', myMomentsService]);

	function myMomentsService(downloadManager, core, $q, logger, localStorageManager) {
		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;
		this.initialize = initialize;
		this.getTotalLikes = getTotalLikes;
		this.getExtraLikes = getExtraLikes;

		this.momentArray = localStorageManager.get('myMoments');
		
		totalLikes = localStorageManager.get('totalLikes');
		this.oldLikes = 0;
		extraLikes = 0;
		if(!this.momentArray) {
			//Should not happen
			this.momentArray = [];
		}

		function getExtraLikes() {
			return extraLikes;
		}

		function getTotalLikes() {
			return totalLikes;
		};

		if(this.momentArray === null) {
			for(var i = 0; i < this.momentArray.length; i) {
				if(!this.momentArray[i].key) {
					this.momentArray.splice(i, 1);
				}
				else {
					this.momentArray[i].time = core.timeElapsed(this.momentArray[i].time);
					i++;
				}
			}
		}

		function initialize() {
			var deferred = $q.defer();
			this.momentArray = localStorageManager.get('myMoments');
			var oldMomentArray = this.momentArray; //Variable get overriden somewhere...
			var deletedMoments = [];
			totalLikes = 0;
			updateOldLikes(this.momentArray);
			async.each(this.momentArray, function(moment, callback) {
				//Remove moments which have been deleted
				this.momentArray = oldMomentArray; //Variable gets overriden somewhere...
				core.getMomentMetaData(moment).then(function(returnedMoment) {
					if(returnedMoment !== "Not Found") {
						for(var i = 0; i < oldMomentArray.length;i++) {
							if(oldMomentArray[i].key === returnedMoment.key) {
								oldMomentArray[i] = returnedMoment;
							}
						}
					} else {
						deletedMoments.push(moment);
					}
					callback();
				}, function(error) {
					deletedMoments.push(moment);
					callback();
				});
			}, function(error) {
				this.momentArray = oldMomentArray;
				if(error) {
					deferred.reject();
				}
				if(this.momentArray) {
					for(var i = 0; i < deletedMoments.length; i++) {
						for(var x = 0; x < this.momentArray.length; x) {
							if(this.momentArray[x].key === deletedMoments[i].key) { 
								this.momentArray.splice(x, 1);
							}
							else {
								x++;
							} 
						}
					}
					downloadManager.downloadFiles(this.momentArray).then(function(moments) {
						localStorageManager.set('myMoments', moments).then(function() {
							this.momentArray =	updateExtraLikesAndTotalLikes(this.momentArray);
							this.momentArray = addShortDescriptionAndTime(this.momentArray);
							deferred.resolve(this.momentArray);
						});
					});
				}
			});
			return deferred.promise;
		};

		function removeFromLocalStorage(moment) {
			// var localMoments = localStorageManager.get('myMoments');
			// localMoments.splice(localMoments.findIndex(findMoment), 1);
			localStorageManager.remove('myMoments', moment);
		};

		function uploadFeedback(feedback, isBug) {
			var defered = $q.defer();
			logger.logReport(feedback, '', createKey(isBug)).then(function() {
				defered.resolve();
			}, function(error) {
				defered.reject(error);
			});
			return defered.promise;
		};
		function findMoment(moment) {
			return moment.location === 'Narberth, PA';
		};

		function createKey(isBug) {
			if(!isBug) {
				return 'reports/feedback.txt';
			}
			else {
				return 'reports/bugs.txt';
			}
		};

		function updateOldLikes(momentArray) {
			if(momentArray) {
				this.oldLikes = 0;
				for(var i = 0; i < momentArray.length; i++) {
					momentArray[i].likes = momentArray[i].likes.toString();
					this.oldLikes = this.oldLikes + parseInt(momentArray[i].likes);
				}
			}
		};

		function updateExtraLikesAndTotalLikes(moments) {
			for(var x = 0; x < moments.length; x++) {
				var currentLikes = 0;
				for(var i = 0; i< this.momentArray.length; i++) {
					if(this.momentArray[i].key === moments[x].key) {
						currentLikes = this.momentArray[i].likes;
						this.momentArray[i].likes = moments[x].likes;
					}
				}
				totalLikes = totalLikes + parseInt(moments[x].likes);
				extraLikes = totalLikes - this.oldLikes;
				moments[x].gainedLikes = moments[x].likes - currentLikes;
				localStorageManager.set('totalLikes', totalLikes);
			}
			return moments;
		}

		function addShortDescriptionAndTime(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].time = core.timeElapsed(moments[i].time);
				if(moments[i].description.length > 0) {
					moments[i].shortDescription = moments[i].description.substring(0,50);
				}
			}
			return moments;
		};


	};
})();