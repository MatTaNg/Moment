(function() {
	angular.module('myMomentsService', [])

	.service('myMomentsService', ['core', myMomentsService]);

	function myMomentsService(core) {
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
			console.log("FEEDBACK");
			console.log(feedback);
			core.logFile(feedback, createKey(isBug));
			};

		};
})();