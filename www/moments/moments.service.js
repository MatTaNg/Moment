(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', 'constants', 'awsServices', 'components', 'logger', 'geolocation', momentsService]);

	function momentsService(core, $q, constants, awsServices, components, logger, geolocation){
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
		this.uploadReport = uploadReport;

		function initializeView() {
			var deferred = $q.defer();
				momentArray = [];
				if(!constants.DEV_MODE) {

					geolocation.calculateNearbyStates().then(function(states) {
			//We cannot load all the images in the AWS database.
			//Instead, we get the users State and figre out which nearby States to load
			//This way we minimize the amount of images to load.
			geolocation.getMomentsByState(states).then(function(moments) {
				var momentsInStates = [];
				for(var i = 0; i < moments.length; i++) {
					for(var x = 0; x < moments[i].length; x++) {
						if(x > 0 && filterImage(moments[i][x].Key)) { //The first key listed is always the folder, skip that.
							momentsInStates.push(moments[i][x]);
						}
					}
				}
				geolocation.getMomentsWithinRadius(momentsInStates).then(function(moments) {
					uploadToBestMoments(moments).then(function() {
						var temp = createTempVariable(moments);
						momentArray = moments;
						localStorage.setItem("moments", JSON.stringify(temp));
						deferred.resolve(temp);		
					});
				}, function(error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});
		}, function(error) {
			console.log("ERROR");
			console.log(error);
			deferred.reject(error);
		});
} //End of DEV_MODE
else {
	core.getHardCodedMoments().then(function(moments) {
		var temp = createTempVariable(moments);
		momentArray = moments;
		localStorage.setItem("moments", JSON.stringify(temp));
		deferred.resolve(temp);		
	},function(error) {
		console.log("ERROR");
		console.log(error);
	});
}


return deferred.promise;
};

function uploadReport(report, moment) {
	var defered = $q.defer();
	core.logReport(report, 'flagged.txt').then(function() {
		defered.resolve();
	}, function(error) {
		defered.reject(error);
	});
	return defered.promise;
};

function updateMoment(liked) {
	var temp = createTempVariable(momentArray);
	var deferred = $q.defer();
	var views = (parseInt(temp[0].views) + 1).toString();
	checkAndDeleteExpiredMoment(momentArray[0]).then(function(deleted) {
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
		components.showLoader().then(function() {
			initializeView().then(function(moments) {
				momentArray = moments;
				var temp = createTempVariable(moments);
				deferred.resolve(temp);
			}, function(error) {
				deferred.reject();
			});
		});
	}
	return deferred.promise;
};

function getMoments() {
	return momentArray;
};

function uploadToBestMoments(moments) {
	return Promise.all(moments.map(
		function(moment) {
			if(moment.likes / moment.views > constants.BEST_MOMENTS_RATIO) {
				var copySource = splitUrlOff(moment.key);
				var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
				// var log = "New BestMoment - moment.uploadToBestMoments" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
				logger.logFile("New BestMoment - moment.uploadToBestMoments", {Moment: moment}, error, 'logs.txt').then(function() {
					awsServices.copyObject(key, copySource, moment, "COPY");
				});

			}
		}
		));
};

function checkAndDeleteExpiredMoment(moment) {
	var deferred = $q.defer();
	var likes = moment.likes,
	view = moment.views,
	currentTime = new Date().getTime(),
	timeElapsed = moment.time,
	timeBetweenMoments = constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_UNTIL_MOMENT_EXPIRES;
	if(currentTime - timeBetweenMoments > timeElapsed) {
		core.remove(moment).then(function(moment){
			var moments = JSON.parse(localStorage.getItem('moments'));
			moments.splice(moments.indexOf(moment), 1);
			localStorage.setItem('moments', JSON.stringify(moments));
			// var log = "Moment Expired - moment.checkAndDeleteExpiredMoment" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
			logger.logFile("Moment Expired - moment.checkAndDeleteExpiredMoment", {Moment: moment}, {}, 'logs.txt').then(function() {
				deferred.resolve(true);
			});

		}, function(error) {
			deferred.reject(error);
		});
	}
	else {
		deferred.resolve(false);
	}
	return deferred.promise;
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

function filterImage(key) {
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