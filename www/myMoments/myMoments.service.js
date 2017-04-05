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
			console.log("FEEDBACK");
			console.log(core.logFile(feedback, createKey(isBug)));
			core.logFile(feedback, createKey(isBug)).then(function() {
				console.log("RESOLVE");
				defered.resolve();
			}, function(error) {
				console.log("REJECT");
				defered.reject(error);
			});
			return defered.promise;
		};

	};
})();