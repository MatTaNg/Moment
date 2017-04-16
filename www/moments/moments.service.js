(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', '$ionicLoading', 'constants', 'awsServices', momentsService]);

	function momentsService(core, $q, $ionicLoading, constants, awsServices){
		if(localStorage.getItem('moments')) {
			var momentArray = JSON.parse(localStorage.getItem('moments'));
		}
		else {
			var momentArray = [];
		}
		var momentArrayLength = 0; //For some reason changing momentArray in the controller affects the momentArray in the service
		var currentCoordinates;
		var deferred = $q.defer();

		this.max_north = {}; //40.4110615750005
		this.max_south = {}; //39.567047425
		this.max_west = {};  //-75.756022274999
		this.max_east = {};  //-74.798121925

		this.getMoments = getMoments;
		this.initializeView = initializeView;
		this.filterMoments = filterMoments;
		this.updateMoment = updateMoment;
		this.incrementCounter = incrementCounter;
		this.calculateNearbyStates = calculateNearbyStates;

		function initializeView() {
			var deferred = $q.defer();
			momentArray = [];
			var ionicLoading = $ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			}).then(function() {
				if(!constants.DEV_MODE) {

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
					var temp = createTempVariable(moments);
					momentArray = moments;
					$ionicLoading.hide().then(function() {
						localStorage.setItem("moments", JSON.stringify(temp));
						deferred.resolve(temp);		
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
} //End of DEV_MODE
else {
	core.getHardCodedMoments().then(function(moments) {
		var temp = createTempVariable(moments);
		momentArray = moments;
		$ionicLoading.hide().then(function() {
			localStorage.setItem("moments", JSON.stringify(temp));
			deferred.resolve(temp);		
		});
	},function(error) {
		console.log("ERROR");
		console.log(error);
	});
}
});
return deferred.promise;
};

function updateMoment(liked) {
	var temp = createTempVariable(momentArray);
	var deferred = $q.defer();
	var views = (parseInt(temp[0].views) + 1).toString();
	core.checkAndDeleteExpiredMoment(momentArray[0]).then(function(deleted) {
		if(!deleted) {
			temp[0].views = views;
			if(liked) {
				var likes = parseInt(temp[0].likes) + 1;
				temp[0].likes = likes.toString();
			}
			temp[0].uuids = temp[0].uuids + " " + core.getUUID();
			core.edit(temp[0]).then(function() {
				momentArray.splice(0, 1);
				incrementCounter().then(function(moments) {
					temp = createTempVariable(moments);
					deferred.resolve(temp);
				});
			}, function(error) {
				console.log("ERROR - MomentService.edit");
				deferred.reject(error);
			});
		}
		else {
			momentArray.splice(0, 1);
			incrementCounter().then(function(moments) {
				deferred.resolve(moments);
			});
		}
	}, function(error) {
		console.log("ERROR: UPDATE MOMENT");
		console.log(error);
	});
	return deferred.promise;
};

function incrementCounter(){
	var deferred = $q.defer();
	var temp = createTempVariable(momentArray);
	if(momentArray.length > 0) {
		deferred.resolve(temp);
	}
	else {
		initializeView().then(function(moments) {
			momentArray = moments;
			var temp = createTempVariable(moments);
			deferred.resolve(temp);
		}, function(error) {
			deferred.reject();
		});
	}
	return deferred.promise;
};

function getMoments() {
	return momentArray;
};

function extractCoordinatesFromKey(key) {
	if(key.includes(',')) {
		var lat = 0;
		var lng = 0;
		var coordinates = key.split('/');
		for(var i = 0; i < coordinates.length; i++) {
			if(coordinates[i].includes(',')) {
				coordinates = coordinates[i].split(',');
				break;
			}
		}
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

	function getStates(north, south, west, east) {
		var deferred = $q.defer();
		var nearbyStates = {};
		core.getDeviceLocation(this.max_north.lat, this.max_north.lng).then(function(location) {
			nearbyStates.north = location.split(',')[1].trim();
			core.getDeviceLocation(max_south.lat, max_south.lng).then(function(location) {
				nearbyStates.south = location.split(',')[1].trim();
				core.getDeviceLocation(max_west.lat, max_west.lng).then(function(location) {
					nearbyStates.west = location.split(',')[1].trim();
					core.getDeviceLocation(max_east.lat, max_east.lng).then(function(location) {
						nearbyStates.east = location.split(',')[1].trim();
						deferred.resolve(nearbyStates);
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
	function calculateNearbyStates() {
		var deferred = $q.defer();

		core.initializeUserLocation().then(function(locationData) {
			this.max_north = { lat: locationData.lat + core.getLatMileRadius(), lng: locationData.lng }; 
			this.max_south = { lat: locationData.lat - core.getLatMileRadius(), lng: locationData.lng }; 
			this.max_west = {  lat: locationData.lat, lng: locationData.lng - core.getLngMileRadius() };
			this.max_east = {  lat: locationData.lat, lng: locationData.lng + core.getLngMileRadius() };

			var nearbyState = {north: "", south: "", west: "", east: ""};
			var result = [];
			getStates(this.max_north, this.max_south, this.max_west, this.max_east).then(function(nearbyStates) {

				result.push(nearbyStates.north);
				if(result.indexOf(nearbyStates.south) === -1) {
					result.push(nearbyStates.south);
				}
				if(!result.indexOf(nearbyStates.west) === -1) {
					result.push(nearbyStates.west);
				}
				if(!result.indexOf(nearbyStates.east) === -1) {
					result.push(nearbyStates.east);
				}
				deferred.resolve(result);
			});
		})

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
				awsServices.getMoments(constants.MOMENT_PREFIX + states[i]).then(function(moments) {
					result.push(moments);
					if(result.length === states.length) {
						deferred.resolve(result);
					}
				}, function(error) {
					console.log("ERROR - momentService.getMomentsByState");
					console.log(error);
					deferred.reject(error);
				});
			})(i);
		}
		return deferred.promise;
	};

	function getMomentsWithinRadius(momentsInStates) {
		return Promise.all(momentsInStates.map(moment =>
			awsServices.getMomentMetaData(moment.Key).then(metaData => ({
				key: constants.IMAGE_URL + moment.Key, 
				description: metaData.description,
				likes: metaData.likes,
				location: metaData.location,
				time: metaData.time,
				uuids: metaData.uuids,
				views: metaData.views
			}))
			));
	};

	function createTempVariable(moments) {
		var temp = [];
		for(var i = 0; i < moments.length; i++) {
			temp.push({
				key: moments[i].key,
				description: moments[i].description,
				likes: moments[i].likes,
				location: moments[i].location,
				time: moments[i].time,
				uuids: moments[i].uuids,
				views: moments[i].views
			});
		}
		return temp;
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
	};
})();