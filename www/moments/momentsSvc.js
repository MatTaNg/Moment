angular.module('app.momentsSvc', [])

.factory('BlankFactory', [function(){

}])

.service('momentsSvc', ['coreSvc', function(coreSvc){
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

	this.updateObject = function(liked, counter){
		var currentKey = momentArray[counter].key;
		var currentMeta = momentArray[counter].metaData;
		var metaData = {location: currentMeta.location,
						time: currentMeta.time,
						likes: currentMeta.likes,
						UUIDS: coreSvc.getUUID()
						};
			if(liked) {
				var likes = parseInt(currentMeta.likes) + 1;
				metaData.likes = likes.toString();
			}
			metaData.UUIDS = currentMeta.UUIDS + " " + coreSvc.getUUID();
			coreSvc.edit(currentKey, metaData);
			this.setMoment(counter, currentKey, metaData);
		};

	this.incrementCounter = function(counter) {
		if(counter + 1 < momentArray.length) {
			return (counter + 1);
		}
		else {
			return 0;
		}
	}
}]);