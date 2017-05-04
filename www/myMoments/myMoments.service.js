(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['core', '$q', 'awsServices', myMomentsService]);

	function myMomentsService(core, $q, awsServices) {
		var findMoment = findMoment,
		oldLocalStorage = {};
		createKey = createKey;

		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;
		this.initialize = initialize;

		function initialize(moments) {
			var promises = [];
			oldLocalStorage = JSON.parse(localStorage.getItem('myMoments'));
			for(var i = 0; i < moments.length; i++) {
				promises.push(
					awsServices.getObject(core.splitUrlOff(moments[i].key))
					);
			}
			return Promise.all(promises);
};

		function removeFromLocalStorage(location) {
			var localMoments = JSON.parse(localStorage.getItem('myMoments'));
			localMoments.splice(localMoments.findIndex(findMoment), 1);
			localStorage.setItem('myMoments', JSON.stringify(localMoments));
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

		function uploadFeedback(feedback, isBug) {
			var defered = $q.defer();
			core.logReport(feedback, createKey(isBug)).then(function() {
				defered.resolve();
			}, function(error) {
				defered.reject(error);
			});
			return defered.promise;
		};

	};
})();