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
			return Promise.all(promises).then(function(results) {
				for(var i = 0; i < results.length; i) {
					console.log("TYPE");
					console.log(JSON.stringify(results));
					console.log(results[i].constructor === Array);
					if(results[i].constructor === Array) { //An empty array is returned is the object is not found, remove it
						console.log("SPLIT");
						results.splice(i, 1);
						console.log(JSON.stringify(results));
					} else {
						i++;
					}
				}
				console.log("RESULTS");
				console.log(results);
				return results;
			});
		};
			// return Promise.all(moments.map(moment => 
			// 	awsServices.getObject(core.splitUrlOff(moment.key)).then(function(object) {
			// 		if(object !== undefined) {
			// 			// return 				
			// 			{
			// 				key: moment.key,
			// 				description: object.description,
			// 				likes: object.likes,
			// 				location: object.location,
			// 				time: core.timeElapsed(object.time),
			// 				uuids: object.uuids,
			// 				views: object.views
			// 			};
			// 		}
			// 	});

				// object => (
				// {
				// 	key: moment.key,
				// 	description: object.description,
				// 	likes: object.likes,
				// 	location: object.location,
				// 	time: core.timeElapsed(object.time),
				// 	uuids: object.uuids,
				// 	views: object.views
				// }))
			// )).then(function(moments) {
			// 	for(var i = 0; i < oldLocalStorage.length; i++) {
			// 		var gainedLikes = moments[i].likes - oldLocalStorage[i].likes;
			// 		oldLocalStorage[i] = moments[i];
			// 		oldLocalStorage[i].gainedLikes = gainedLikes;
			// 		vm.totalLikes = vm.totalLikes + parseInt(oldLocalStorage[i].likes);
			// 		calculateNumberOfExtraLikes();
			// 		oldLocalStorage[i].time = core.timeElapsed(oldLocalStorage[i].time);
			// 		if(oldLocalStorage[i].description.length > 0) {
			// 			oldLocalStorage[i].shortDescription = oldLocalStorage[i].description.substring(0, 50);
			// 			oldLocalStorage[i].showShortDescription = true;
			// 		}
			// 	}
			// });
		// };

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