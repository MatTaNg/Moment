(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['core', '$q', 'awsServices', myMomentsService]);

	function myMomentsService(core, $q, awsServices) {
		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;
		this.initialize = initialize;

		this.momentArray = JSON.parse(localStorage.getItem('myMoments'));
		this.totalLikes = 0;
		this.oldLikes = 0;
		this.extraLikes = 0;
		
		for(var i = 0; i < this.momentArray.length; i) {
			if(!this.momentArray[i].key) {
				this.momentArray.splice(i, 1);
			}
			else {
				this.momentArray[i].time = core.timeElapsed(this.momentArray[i].time);
				i++;
			}
		}

		function initialize(moments) {
			var promises = [];
			updateOldLikes(this.momentArray);
			for(var i = 0; i < moments.length; i++) {
				promises.push(
					awsServices.getObject(core.splitUrlOff(moments[i].key)).then(function(moment) {
						if(moment.Metadata !== undefined) {
							moment = moment.Metadata;
							updateExtraLikesAndTotalLikes(moment);
							addShortDescriptionAndTime(moment);
							return moment;
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
			core.logReport(feedback, createKey(isBug)).then(function() {
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
				return 'feedback.txt';
			}
			else {
				return 'bugs.txt';
			}
		};

		function updateOldLikes(momentArray) {
			for(var i = 0; i < momentArray.length; i++) {
				this.oldLikes = this.oldLikes + parseInt(this.momentArray[i].likes);
			}
		};

		function updateExtraLikesAndTotalLikes(moment) {
			this.totalLikes = this.totalLikes + parseInt(moment.likes);
			this.extraLikes = this.totalLikes - this.oldLikes;
		}

		function addShortDescriptionAndTime(moment) {
			moment.time = core.timeElapsed(moment.time);
			if(moment.description.length > 0) {
				moment.shortDescription = moment.description.substring(0,50);
			}
		};
	};
})();