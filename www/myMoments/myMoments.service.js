(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['core', '$q', myMomentsService]);

	function myMomentsService(core, $q) {
		var findMoment = findMoment,
		createKey = createKey;

		this.removeFromLocalStorage = removeFromLocalStorage;
		this.uploadFeedback = uploadFeedback;

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
			core.logFile(feedback, createKey(isBug)).then(function() {
				defered.resolve();
			}, function(error) {
				defered.reject(error);
			});
			return defered.promise;
		};

	};
})();