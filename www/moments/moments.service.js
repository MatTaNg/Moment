(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', momentsService]);

	function momentsService(core, $q){
		var momentArray = [];
		this.getMoments = getMoments;
		this.initializeView = initializeView;
		this.filterMoments = filterMoments;
		this.updateObject = updateObject;
		this.incrementCounter = incrementCounter;

		function getMoments() {
			return momentArray;
		};

		function initializeView() {
			var deferred = $q.defer();

			core.initiateMoments(core.getMomentPrefix())
			.then(function(moments) {
				momentArray = filterMoments(moments);
				deferred.resolve(momentArray);
			}, function(error) {
				console.log("ERROR");
				console.log(error.stack);
				deferred.reject(error);
			});

			return deferred.promise;
		};

		function filterMoments(moments) {
			var result = moments;
			if(moments) {
				for(var i = 0; i < moments.length;) {
					//Make not null
					if(!(moments[i].uuids.includes(core.getUUID()))) {
						result.splice(i, 1);
					}
					else {
						i++;
					}
				}
	}
	return result;
};

function updateObject(liked, counter) {
	console.log(momentArray.length);
	if(momentArray[counter]) {
		var views = (parseInt(momentArray[counter].views) + 1).toString();
		var moment = 
		{	key: momentArray[counter].key,
			location: momentArray[counter].location,
			likes: momentArray[counter].likes,
			description: momentArray[counter].description,
			views: views,
			uuids: core.getUUID()
		};
		if(liked) {
			var likes = parseInt(moment.likes) + 1;
			moment.likes = likes.toString();
		}
		console.log("TEST2");
		moment.uuids = moment.uuids + " " + core.getUUID();
		core.edit(moment.key, {uuids: moment.uuids, likes: moment.likes});
		momentArray[counter] = moment;
	}
	else { //If user hits button on No Results Found screen
		console.log("TEST");
		return undefined;
	}
};

function incrementCounter(counter){
	if(counter + 1 < momentArray.length) {
		return (counter + 1);
	}
	else {
		return -1;
	}
}
};
})();