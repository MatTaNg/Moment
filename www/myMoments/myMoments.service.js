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
			// var s3 = core.initiateBucket();
			// var key = createKey(isBug);
			// var params = {
			// 	Bucket: core.getBucketName(),
			// 	Key: key
			// };
			// s3.getObject(params, function(error, data) {
			// 	if(error) {
			// 		console.log(error, error.stack);
			// 	}
			// 	else {
			// 		feedback = data.Body.toString() + "\r\n" + feedback;
			// 		var blob = new Blob([feedback], {type: "text"});
			// 		var file =  new File([blob], key);
			// 		core.upload(file, key, {});
			// 	}
			};

		};
})();