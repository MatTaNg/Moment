(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['common', 'downloadManager','core', '$q', 'logger', 'localStorageManager', 'commentManager', myMomentsService]);

	function myMomentsService(common, downloadManager, core, $q, logger, localStorageManager, commentManager) {
		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;
		this.initialize = initialize;
		this.getTotalLikes = getTotalLikes;
		this.getExtraLikes = getExtraLikes;
		this.retrieveCommentedOnMoments = retrieveCommentedOnMoments;
		
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
					this.momentArray[i].time = common.timeElapsed(this.momentArray[i].time);
					i++;
				}
			}
		}

		function getComments(moments) {
			return commentManager.retrieveCommentsAndAddToMoments(moments);
		};

		function retrieveCommentedOnMoments() {
			return commentManager.retrieveCommentedOnMoments(common.getUUID());
		};

		function updateMyMomentsWithRecentChanges(momentArray, newMoment) {
			for(var i = 0; i < momentArray.length;i++) {
				if(momentArray[i].key === newMoment.key) {
					momentArray[i] = newMoment;
				}
			}
			return momentArray;
		}

		function createArrayOfUploadedMomentsWhichHaveExpired_UpdateExistingOnes(momentArray) {
			var deferred = $q.defer();
			var oldMomentArray = momentArray;
			async.each(momentArray, function(moment, callback) {
				core.getMomentMetaData(moment).then(function(returnedMoment) {
					if(returnedMoment !== "Not Found") {
						momentArray = updateMyMomentsWithRecentChanges(momentArray, returnedMoment);
							callback();
					}
				}, function(error) {
					callback();
				});
			}, function(error) {
				if(!error) {
					deferred.resolve(momentArray);
				}
				else {
					deferred.reject(error);
				}
			});
			return deferred.promise;
		};

		function initialize() {
			var deferred = $q.defer();
			this.momentArray = localStorageManager.get('myMoments');
			var oldMomentArray = this.momentArray; //Variable get overriden somewhere...
			var deletedMoments = [];
			totalLikes = 0;
			updateOldLikes(this.momentArray);
			createArrayOfUploadedMomentsWhichHaveExpired_UpdateExistingOnes(this.momentArray).then(function(updatedMoments) {
				this.momentArray = updatedMoments;
				if(this.momentArray.length === 0) {
					deferred.resolve([]);
				}
				if(this.momentArray.length > 0) {
					localStorageManager.set('myMoments', this.momentArray).then(function() {
						this.momentArray =	updateExtraLikesTotalLikesAndGainedLikes(this.momentArray);
						this.momentArray = addShortDescriptionAndTime(this.momentArray);
						getComments(this.momentArray).then(function(moments) {
							this.momentArray = moments;
							console.log("MY MOMENT INIT FINISHED");
							deferred.resolve(this.momentArray);
						});
					});
				}
			});
			return deferred.promise;
		};

		function removeFromLocalStorage(moment) {
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

		function updateExtraLikesTotalLikesAndGainedLikes(moments) {
			for(var x = 0; x < moments.length; x++) {
				var currentLikes = 0;
				currentLikes = moments[x].likes;
				totalLikes = totalLikes + parseInt(moments[x].likes);
				extraLikes = totalLikes - this.oldLikes;
				moments[x].gainedLikes = moments[x].likes - currentLikes;
				localStorageManager.set('totalLikes', totalLikes);
			}
			return moments;
		}

		function addShortDescriptionAndTime(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].time = common.timeElapsed(moments[i].time, true);
				if(moments[i].description.length > 0) {
					moments[i].shortDescription = moments[i].description.substring(0,50);
				}
			}
			return moments;
		};


	};
})();