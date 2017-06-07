(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['core', '$q', 'awsServices', 'logger', myMomentsService]);

	function myMomentsService(core, $q, awsServices, logger) {
		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;
		this.initialize = initialize;
		this.getTotalLikes = getTotalLikes;
		this.getExtraLikes = getExtraLikes;

		this.momentArray = JSON.parse(localStorage.getItem('myMoments'));
		var totalLikes = 0;
		this.oldLikes = 0;
		var extraLikes = 0;

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

		function initialize(moments) {
			var oldMomentArray = this.momentArray; //Variable get overriden somewhere...
			var promises = [];
			totalLikes = 0;
			updateOldLikes(this.momentArray);
			for(var i = 0; i < moments.length; i++) {
				promises.push(
					awsServices.getObject(core.splitUrlOff(moments[i].key)).then(function(moment) {
						if(moment !== "Not Found") {
							moment = moment.Metadata;
							this.momentArray = oldMomentArray;
							updateExtraLikesAndTotalLikes(moment);
							moment = addShortDescriptionAndTime(moment);
							return moment;
						} else {
							return null; //Find a better way to handle this
						}
					})
					);
			}
			return Promise.all(promises);
		};

		function removeFromLocalStorage(location) {
			var localMoments = JSON.parse(localStorage.getItem('myMoments'));
			localMoments.splice(localMoments.findIndex(findMoment), 1);
			localStorage.setItem('myMoments', JSON.stringify(localMoments));
		};

		function uploadFeedback(feedback, isBug) {
			var defered = $q.defer();
			logger.logReport(feedback, createKey(isBug)).then(function() {
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
			this.oldLikes = 0;
			for(var i = 0; i < momentArray.length; i++) {
				momentArray[i].likes = momentArray[i].likes.toString();
				this.oldLikes = this.oldLikes + parseInt(momentArray[i].likes);
			}
		};

		function updateExtraLikesAndTotalLikes(moment) {
			var currentLikes = 0;
			for(var i = 0; i< this.momentArray.length; i++) {
				if(this.momentArray[i].key === moment.key) {
					currentLikes = this.momentArray[i].likes;
					this.momentArray[i].likes = moment.likes;
				}
			}
			totalLikes = totalLikes + parseInt(moment.likes);
			extraLikes = totalLikes - this.oldLikes;
			moment.gainedLikes = moment.likes - currentLikes;
		}

		function addShortDescriptionAndTime(moment) {
			moment.time = core.timeElapsed(moment.time);
			if(moment.description.length > 0) {
				moment.shortDescription = moment.description.substring(0,50);
			}
			return moment;
		};
	};
})();