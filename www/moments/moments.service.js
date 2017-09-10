(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', 'constants', 'logger', 'geolocation', 'awsServices', 'localStorageManager', momentsService]);

	function momentsService(core, $q, constants, logger, geolocation, awsService, localStorageManager){
		this.momentArray = localStorageManager.get('moments');

		this.initializeView = initializeView;
		this.isMomentWithRadius = isMomentWithRadius;
		this.updateMoment = updateMoment;
		this.incrementCounter = incrementCounter;
		this.uploadReport = uploadReport;

		this.checkAndDeleteExpiredMoments = checkAndDeleteExpiredMoments;
		this.getNearbyMoments = getNearbyMoments;
		this.deleteOrUploadToBestMoments = deleteOrUploadToBestMoments;

		this.updateMomentMetaData = updateMomentMetaData;

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function getNearbyMoments() {
			var getLocation = core.getLocation;
			var calculateNearbyStates = geolocation.calculateNearbyStates;
			var getMomentsByState = geolocation.getMomentsByState;
			var concatMoments = function(moments) {
				for(var i = 0; i < moments.length; i) {
					//Take out any empty arrays
					if(moments[i].length === 0) {
						moments.splice(i, 1);
					} else {
						i++;
					}
				}
				var deferred = $q.defer();
				if(moments.length !== 0 ){
					deferred.resolve(moments[0]); //Object returns as [[{}]], fixing this.
				} else {
					deferred.resolve(moments);
				}
				return deferred.promise;
			};
			var getMomentsWithinRadius = geolocation.getMomentsWithinRadius;
			if(core.currentLocation === "Could not find location") {
				return core.getLocation()
				.then(calculateNearbyStates)
				.then(getMomentsByState)
				.then(concatMoments)
				.then(getMomentsWithinRadius)
			}
			else {
				return calculateNearbyStates()
					.then(getMomentsByState)
					.then(concatMoments)
					.then(getMomentsWithinRadius)		
			}
		};

		function initializeView() {
			if(core.appInitialized === false) {
				this.momentArray = [];
			}
			var deferred = $q.defer();
			var deleteOrUploadToBestMoments = this.deleteOrUploadToBestMoments;
			var checkAndDeleteExpiredMoments = this.checkAndDeleteExpiredMoments;
			// this.momentArray = [];
			getNearbyMoments()
			.then(deleteOrUploadToBestMoments)
			.then(checkAndDeleteExpiredMoments).then(function(moments) {
				for(var i = 0; i < moments.length; i) {
					if(moments[i].uuids.split(" ").indexOf(core.getUUID()) !== -1) {
						moments.splice(i, 1);
					} else {
						i++;
					}
				}
				var temp = createTempVariable(moments);
				core.didUserChangeRadius = false;
				this.momentArray = moments;
				temp = addExtraClassesandSetTime(temp);
				localStorageManager.set('moments', temp);
				deferred.resolve(temp);		
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					deferred.reject(error);
				});
			return deferred.promise;
		};

		function uploadReport(report, moment) {
			var defered = $q.defer();
			logger.logReport(report, 'flagged.txt').then(function() {
				defered.resolve();
			}, function(error) {
				defered.reject(error);
			});
			return defered.promise;
		};

		function updateMoment(liked) {
			var temp = createTempVariable(this.momentArray);
			var updatedMoment = temp[0];
			var deferred = $q.defer();
			updatedMoment = updateMomentMetaData(updatedMoment, liked);
			core.edit(updatedMoment).then(function() {
				this.momentArray = temp;
						this.momentArray.splice(0, 1);
						incrementCounter().then(function(moments) {
							moments = addExtraClassesandSetTime(moments);
							deferred.resolve(moments);
						}, function(error) {
							deferred.reject(error);
						});
					}, function(error) {
						this.momentArray.splice(0, 1);
						incrementCounter().then(function(moments) {
							deferred.resolve(moments);
						});
					});
			return deferred.promise;
		};

		function incrementCounter(){
			var deferred = $q.defer();
			var temp = createTempVariable(this.momentArray);
			if(this.momentArray.length > 0) {
				deferred.resolve(temp);
			}
			else {
				initializeView().then(function(moments) {
					deferred.resolve(moments);
				}, function(error) {
					deferred.reject();
				});
			}
			return deferred.promise;
		};

//Helper functions

function updateMomentMetaData(moment, liked) {
	var temp = createTempVariable(moment);
	var views = (parseInt(moment.views) + 1).toString();
	moment.views = views;
	if(liked) {
		var likes = parseInt(moment.likes) + 1;
		moment.likes = likes.toString();
	}
	moment.uuids = moment.uuids + " " + core.getUUID();
	return moment;
};

//In order to upload to best moments the likes / views need to be more than the 'BEST_MOMENTS_RATIO' it also needs a minimum amount of views
function deleteOrUploadToBestMoments(moments) {
	var deferred = $q.defer();
	if(moments.length === 0) {
		deferred.resolve(moments);
	}
	for(var i = 0; i < moments.length; i++ ){
		(function(i) {
			if(parseInt(moments[i].views) > constants.BEST_MOMENTS_MIN_VIEWS) {
					if(parseInt(moments[i].likes) / parseInt(moments[i].views) > constants.BEST_MOMENTS_RATIO) {
						core.uploadToBestMoments(moments[i]);
				} 
				//Remove Best Moment - We divide by 2; otherwise this will run everytime a moment is above the min views mark and does not belong in bestMoments - Which will be almost every time.
				else if(parseInt(moments[i].likes) / parseInt(moments[i].views) > constants.BEST_MOMENTS_RATIO / 2) {
					core.removeFromBestMoments(moments[i]);
				}
			}
			if(i === moments.length - 1) {
				deferred.resolve(moments);
			}
		}(i));
	}
	return deferred.promise;
};

function checkAndDeleteExpiredMoments(moments) {
	var deferred = $q.defer();
	var tempMoments = createTempVariable(moments);
	currentTime = new Date().getTime(),
	timeBetweenMoments = constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_UNTIL_MOMENT_EXPIRES;
	var momentsToBeDeleted = [];
	if(moments.length === 0) {
		deferred.resolve(moments);
	}
	for(var i = 0; i < moments.length; i++) {
		(function(i) {
			timeElapsed = moments[i].time;
			if(currentTime - timeBetweenMoments > timeElapsed) {
				if(localStorageManager.get('moments')) {
					removeMomentFromLocalStorage(moments[i]);
				}
				core.remove(moments[i]);
				momentsToBeDeleted.push(i);
			}
			if(i === moments.length - 1) {
				for(var x = momentsToBeDeleted.length - 1; x > 0; x--){
					tempMoments.splice(momentsToBeDeleted[x], 1);
				}
				deferred.resolve(tempMoments);
			}
		})(i);

	}
	return deferred.promise;
};

function addExtraClassesandSetTime(moments) {
	for(var i = 0; i < moments.length; i++) {
		if(i === 0) {
			moments[0].class = "layer-top";
			moments[0].time = core.timeElapsed(moments[0].time);
		}
		else if(i === 1) {
			moments[1].class = "layer-next";
			moments[1].time = core.timeElapsed(moments[1].time);
		}
		else {
			moments[i].class = "layer-hide";
			moments[i].time = core.timeElapsed(moments[i].time); 
		}
	}
	
	
	return moments;
};

function getMomentsOnlyWithinRadius(moments){
	var momentsInStates = [];
	for(var i = 0; i < moments.length; i++) {
		if(isMomentWithRadius(moments[i].Key)) { //The first key listed is always the folder, skip that.
			momentsInStates.push(moments[i]);
		}
	}
	return momentsInStates;
};

function removeMomentFromLocalStorage(moment) {
	var moments = localStorageManager.get('moments');
	moments.splice(moments.indexOf(moment), 1);
	localStorageManager.set('moments', (moments));
};

function extractCoordinatesFromKey(key) {
	var lat = 0;
	var lng = 0;
	var coordinates = key.split('/')[key.split('/').length - 1];
	coordinates = coordinates.split('_');
	lat = coordinates[0].trim();
	lng = coordinates[1].trim();
	var result = {latitude: lat, longitude: lng};
	return result;
};

function isMomentWithRadius(key) {
	var coordinates = extractCoordinatesFromKey(key);
	var lat = coordinates.latitude;
	var lng = coordinates.longitude;
	if((lat < geolocation.max_north.lat && lat > geolocation.max_south.lat) &&
		(lng > geolocation.max_west.lng && lng < geolocation.max_east.lng )) {
		return true;
}
else {
	return false;
}
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
			views: moments[i].views,
			media: moments[i].media
		});
	}
	return temp;
};

	};
})();