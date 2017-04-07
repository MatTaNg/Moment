(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', '$ionicLoading', 'constants', momentsService]);

	function momentsService(core, $q, $ionicLoading, constants){
		var momentArray = [];
		var momentArrayLength = 0; //For some reason changing momentArray in the controller affects the momentArray in the service
		var currentCoordinates;
		var deferred = $q.defer();
		var s3 = core.initiateBucket();

		this.max_north = {}; //40.4110615750005
		this.max_south = {}; //39.567047425
		this.max_west = {};  //-75.756022274999
		this.max_east = {};  //-74.798121925

		this.getMoments = getMoments;
		this.initializeView = initializeView;
		this.filterMoments = filterMoments;
		this.updateObject = updateObject;
		this.incrementCounter = incrementCounter;
		this.calculateNearbyStates = calculateNearbyStates;

		function getMoments() {
			return momentArray;
		};

		function extractCoordinatesFromKey(key) {
			if(key.includes(',')) {
				var lat = 0;
				var lng = 0;
				var coordinates = key.split('/');
				coordinates = coordinates[coordinates.length - 1];
				coordinates = coordinates.split(',');
				lat = coordinates[0].trim();
				//Pop off the extension
				lng = coordinates[1].split('.');
				lng.pop();
				lng = (lng[0] + "." + lng[1]).trim();
				lng = lng.split("_")[0];
				var result = {latitude: lat, longitude: lng};
				return result;
			}
		};

		function filterImage(key) {
			var coordinates = extractCoordinatesFromKey(key);
			var lat = coordinates.latitude;
			var lng = coordinates.longitude;
			if((lat < max_north.lat && lat > max_south.lat) &&
				(lng > max_west.lng && lng < max_east.lng )) {
				return true;
		}
		else {
			return false;
		}
	};

	function calculateNearbyStates() {
		var deferred = $q.defer();

		core.initializeUserLocation().then(function(locationData) {
			this.max_north = { lat: locationData.lat + core.getLatMileRadius(), lng: locationData.lng }; 
			this.max_south = { lat: locationData.lat - core.getLatMileRadius(), lng: locationData.lng }; 
			this.max_west = {  lat: locationData.lat, lng: locationData.lng - core.getLngMileRadius() };
			this.max_east = {  lat: locationData.lat, lng: locationData.lng + core.getLngMileRadius() };

			var nearbyState = {north: "", south: "", west: "", east: ""};
			var result = [];
			core.getDeviceLocation(this.max_north.lat, this.max_north.lng).then(function(location) {
				nearbyState.north = location.split(',')[1].trim();
				core.getDeviceLocation(max_south.lat, max_south.lng).then(function(location) {
					nearbyState.south = location.split(',')[1].trim();
					core.getDeviceLocation(max_west.lat, max_west.lng).then(function(location) {
						nearbyState.west = location.split(',')[1].trim();
						core.getDeviceLocation(max_east.lat, max_east.lng).then(function(location) {
							nearbyState.east = location.split(',')[1].trim();

							result.push(nearbyState.north);
							if(result.indexOf(nearbyState.south) === -1) {
								result.push(nearbyState.south);
							}
							if(!result.indexOf(nearbyState.west) === -1) {
								result.push(nearbyState.west);
							}
							if(!result.indexOf(nearbyState.east) === -1) {
								result.push(nearbyState.east);
							}
							deferred.resolve(result);
						});
					});
				});
			});
		}, function(error) {
			deferred.reject(error);
			console.log("COULD NOT GET LOCATION");
			console.log(error);
		});
return deferred.promise;
};

function getMomentsByState(states) {
	var deferred = $q.defer();
	var result = [];
	for(var i = 0; i < states.length; i++) {
		(function(i) {
			var params = {
				Bucket: constants.BUCKET_NAME,
				Prefix: constants.MOMENT_PREFIX + states[i]
			};
			s3.listObjectsV2(params, function(error, data) {
				if(!error) {
					
					result.push(data.Contents);
					if(result.length === states.length) {
						deferred.resolve(result);
					}
				}
				else {
					console.log("ERROR");
					console.log(error);
				}
			});
		})(i);
	}
	return deferred.promise;
};

function getMomentsWithinRadius(momentsInStates) {
	var deferred = $q.defer();
	for(var i = 0; i < momentsInStates.length; i++) {
		(function(i) {
			var params = {
				Bucket: constants.BUCKET_NAME,
				Key: momentsInStates[i].Key
			};
			s3.headObject(params, function(error, data) {
				if(!error) {
					var time = core.timeElapsed(data.Metadata.time);
					momentArray.push({ 
						key: constants.IMAGE_URL + momentsInStates[i].Key, 
						description: data.Metadata.description,
						likes: data.Metadata.likes,
						location: data.Metadata.location,
						time: time,
						uuids: data.Metadata.uuids,
						views: data.Metadata.views
					});
					if(momentArray.length === momentsInStates.length) {
						momentArrayLength = momentArray.length;
						deferred.resolve(momentArray);
					}
				}
				else {
					console.log("ERROR");
					console.log(error.message);
					deferred.reject(error.message);
				}
			});
		})(i);
	}
	if(momentsInStates.length === 0) {
		deferred.resolve();
	}
	return deferred.promise;
};

function initializeView() {
	var deferred = $q.defer();
	momentArray = [];

	var ionicLoading = $ionicLoading.show({
		template: '<ion-spinner></ion-spinner>'
	}).then(function() {
		calculateNearbyStates().then(function(states) {
			//We cannot load all the images in the AWS database.
			//Instead, we get the users State and figre out which nearby States to load
			//This way we minimize the amount of images to load.
			getMomentsByState(states).then(function(moments) {
				var momentsInStates = [];
				for(var i = 0; i < moments.length; i++) {
					for(var x = 0; x < moments[i].length; x++) {
						if(x > 0 && filterImage(moments[i][x].Key)) { //The first key listed is always the folder, skip that.
							momentsInStates.push(moments[i][x]);
						}
					}
				}
				getMomentsWithinRadius(momentsInStates).then(function(moments) {
					$ionicLoading.hide().then(function() {
						deferred.resolve(moments);		
					});
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					$ionicLoading.hide().then(function() {
						deferred.reject(error);
					});
				});
			}, function(error) {
				$ionicLoading.hide().then(function() {
					deferred.reject(error);
				});
			});
		}, function(error) {
			console.log("CALCULATE NEARBY STATES ERROR");
			console.log(error.message);
			$ionicLoading.hide().then(function() {
				deferred.reject(error);
			});
		});
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
			if(momentArray[counter]) {
				var views = (parseInt(momentArray[counter].views) + 1).toString();
				var moment = 
				{	key: momentArray[counter].key,
					location: momentArray[counter].location,
					likes: momentArray[counter].likes,
					description: momentArray[counter].description,
					views: views,
					time: momentArray[counter].time,
					uuids: core.getUUID()
				};

				delete moment["swipedRight"];
				delete moment["swipedLeft"];
				//Angular puts attributes on our object to track it.  Delete it.
				delete moment["$$hashkey"];
				delete moment["class"];
				if(liked) {
					var likes = parseInt(moment.likes) + 1;
					moment.likes = likes.toString();
					console.log(moment.likes);
				}
				moment.uuids = moment.uuids + " " + core.getUUID();
				core.edit(moment.key, moment).then(function() {
					momentArray[counter] = moment;
				}, function(error) {

				});
				
			}
	else { //If user hits button on No Results Found screen
		return undefined;
	}
};

function incrementCounter(counter){
	if(counter + 1 < momentArrayLength) {
		return (counter + 1);
	}
	else {
		return -1;
	}
}
};
})();