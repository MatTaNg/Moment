angular.module('app.momentsSvc', [])

.service('momentsSvc', ['coreSvc', '$q', function(coreSvc, $q){
	var momentArray = [];

	this.getMoments = function() {
		return momentArray;
	};

	this.addMoment = function(key, metaData) {
		momentArray.push({key, metaData});
	};

	this.setMoment = function(index, key, metaData) {
		momentArray[index] = {key, metaData};
	}

	this.initializeView = function() {
		var deferred = $q.defer();

		coreSvc.initiateMoments(coreSvc.getMomentPrefix())
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

	var filterMoments = function(moments) {
		var result = moments;
		if(moments) {
			for(var i = 0; i < moments.length;) {
			//Make not null
			if(!(moments[i].uuids.includes(coreSvc.getUUID()))) {
				result.splice(i, 1);
			}
			else {
				i++;
			}
		}
	}
	return result;
};

this.updateObject = function(liked, counter){
	if(momentArray[counter]) {
		var currentKey = momentArray[counter].key;
		var currentMeta = momentArray[counter].metaData;
		var views = (parseInt(momentArray[counter].views) + 1).toString();
		var metaData = {location: momentArray[counter].location,
			likes: momentArray[counter].likes,
			description: momentArray[counter].description,
			views: views,
			UUIDS: coreSvc.getUUID()
		};
		if(liked) {
			var likes = parseInt(momentArray[counter].likes) + 1;
			metaData.likes = likes.toString();
		}
		metaData.UUIDS = momentArray[counter].uuids + " " + coreSvc.getUUID();
		coreSvc.edit(currentKey, metaData);
		this.setMoment(counter, currentKey, metaData);
	}
	else { //If user hits button on No Results Found screen
		return undefined;
	}
};

this.incrementCounter = function(counter) {
	if(counter + 1 < momentArray.length) {
		return (counter + 1);
	}
	else {
		return -1;
	}
}
}]);