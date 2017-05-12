(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', 'constants', 'awsServices', 'components', 'logger', 'geolocation', momentsService]);

	function momentsService(core, $q, constants, awsServices, components, logger, geolocation){
		this.momentArray;
		this.initializeView = initializeView;
		this.isMomentWithRadius = isMomentWithRadius;
		this.updateMoment = updateMoment;
		this.incrementCounter = incrementCounter;
		this.uploadReport = uploadReport;
		
		if(localStorage.getItem('moments')) {
			this.momentArray = JSON.parse(localStorage.getItem('moments'));
		}
		else {
			this.momentArray = [];
		}

		function initializeView() {
			var deferred = $q.defer();
			// this.momentArray = [];
			if(!constants.DEV_MODE) {

				geolocation.calculateNearbyStates().then(function(states) {
			//We cannot load all the images in the AWS database.
			//Instead, we get the users State and figre out which nearby States to load
			//This way we minimize the amount of images to load.
			geolocation.getMomentsByState(states).then(function(moments) {
				var momentsInStates = getMomentsOnlyWithinRadius(moments);

				geolocation.getMomentsWithinRadius(momentsInStates).then(function(moments) {
					uploadToBestMoments(moments).then(function() {
						var temp = createTempVariable(moments);
						core.didUserChangeRadius = false;
						this.momentArray = moments;
						temp = addExtraClasses(temp);
						localStorage.setItem('moments', JSON.stringify(temp));
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
		core.didUserChangeRadius = false;
		var temp = createTempVariable(moments);
		this.momentArray = moments;
		temp = addExtraClasses(temp);
		localStorage.setItem("moments", JSON.stringify(temp));
		deferred.resolve(temp);		
	}, function(error) {
		console.log("ERROR");
		console.log(error);
	});
}


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

function updateMomentMetaData(moment, liked) {
	var views = (parseInt(temp[0].views) + 1).toString();
	temp[0].views = views;
	if(liked) {
		var likes = parseInt(temp[0].likes) + 1;
		temp[0].likes = likes.toString();
	}
	temp[0].uuids = temp[0].uuids + " " + core.getUUID();
};

function updateMoment(liked) {
	var temp = createTempVariable(this.momentArray);
	var updatedMoment = this.momentArray[0];
	var deferred = $q.defer();
	checkAndDeleteExpiredMoment(this.momentArray[0]).then(function(deleted) {
		if(!deleted) {
			updatedMoment = updateMomentMetaData(updatedMoment, liked);

			core.edit(updatedMoment).then(function() {
				this.momentArray.splice(0, 1);
				incrementCounter().then(function(moments) {
					// temp = createTempVariable(moments);
					deferred.resolve(moments);
				});
			}, function(error) {
				this.momentArray.splice(0, 1);
				incrementCounter().then(function(moments) {
					// temp = createTempVariable(moments);
					deferred.resolve(moments);
				});
			});
		}
		else {
			this.momentArray.splice(0, 1);
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
	var temp = createTempVariable(this.momentArray);
	if(this.momentArray.length > 0) {
		deferred.resolve(temp);
	}
	else {
		components.showLoader().then(function() {
			initializeView().then(function(moments) {
				// var temp = createTempVariable(moments);
				deferred.resolve(moments);
			}, function(error) {
				deferred.reject();
			});
		});
	}
	return deferred.promise;
};

function uploadToBestMoments(moments) {
	return Promise.all(moments.map(
		function(moment) {
			if(moment.likes / moment.views > constants.BEST_MOMENTS_RATIO) {
				var copySource = core.splitUrlOff(moment.key);
				var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
				// var log = "New BestMoment - moment.uploadToBestMoments" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
				logger.logFile("New BestMoment - moment.uploadToBestMoments", {Moment: moment}, {}, 'logs.txt')
				.then(function() {
					awsServices.copyObject(key, copySource, moment, "COPY");
				});

			}
		}
		));
};


function checkAndDeleteExpiredMoment(moment) {
	var deferred = $q.defer();
	var likes = moment.likes,
	currentTime = new Date().getTime(),
	timeElapsed = moment.time,
	timeBetweenMoments = constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_UNTIL_MOMENT_EXPIRES;
	if(currentTime - timeBetweenMoments > timeElapsed) {
		core.remove(moment).then(function(moment){
			removeMomentFromLocalStorage(moment);
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

//Helper functions

function addExtraClasses(moments) {
	if(moments.length > 0) {
		for(var i = 0; i < moments.length; i++) {
			moments[i].class = "layer-bottom";
			moments[i].time = core.timeElapsed(moments[i].time);
		}
		moments[0].class = "layer-top";
	}
	return moments;
};

function getMomentsOnlyWithinRadius(moments){
	var momentsInStates = [];
	for(var i = 0; i < moments.length; i++) {
		for(var x = 0; x < moments[i].length; x++) {
						if(isMomentWithRadius(moments[i][x].Key)) { //The first key listed is always the folder, skip that.
							momentsInStates.push(moments[i][x]);
						}
					}
				}
				return momentsInStates;
			}

			function removeMomentFromLocalStorage(moment) {
				var moments = JSON.parse(localStorage.getItem('moments'));
				moments.splice(moments.indexOf(moment), 1);
				localStorage.setItem('moments', JSON.stringify(moments));
			}

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
					views: moments[i].views
				});
			}
			return temp;
		};

		function isMomentWithRadius(moments) {
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