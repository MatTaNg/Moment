(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['core', '$q', 'constants', 'logger', 'geolocation', 'awsServices', momentsService]);

	function momentsService(core, $q, constants, logger, geolocation, awsService){
		this.momentArray = JSON.parse(localStorage.getItem('moments'));

		this.initializeView = initializeView;
		this.isMomentWithRadius = isMomentWithRadius;
		this.updateMoment = updateMoment;
		this.incrementCounter = incrementCounter;
		this.uploadReport = uploadReport;

		this.checkAndDeleteExpiredMoments = checkAndDeleteExpiredMoments;
		this.getNearbyMoments = getNearbyMoments;
		this.deleteOrUploadToBestMoments = deleteOrUploadToBestMoments;

		if(!this.momentArray) {
			this.momentArray = [];
		}
			//We cannot load all the images in the AWS database.
			//Instead, we get the users State and figre out which nearby States to load
			//This way we minimize the amount of images to load.
			function getNearbyMoments() {
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

				return calculateNearbyStates()
					.then(getMomentsByState)
					.then(concatMoments)
					.then(getMomentsWithinRadius)
			};

			function initializeView() {
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
					temp = addExtraClasses(temp);
					localStorage.setItem('moments', JSON.stringify(temp));
					deferred.resolve(temp);		
				}, function(error) {
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
							moments = addExtraClasses(moments);
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
	console.log("DELETE OR UPDATE");
	console.log(JSON.stringify(moments));
	Promise.all(moments.map(
		function(moment) {
			//Upload Best Moment
			if(parseInt(moment.views) > constants.BEST_MOMENTS_MIN_VIEWS) {
				console.log("ASDASS");
				if(parseInt(moment.likes) / parseInt(moment.views) > constants.BEST_MOMENTS_RATIO) {
					core.uploadToBestMoments(moment);
			} 
			//Remove Best Moment
			else if(moment.likes / moment.views > constants.BEST_MOMENTS_RATIO / 2) {
				console.log("ELSE IF");
				core.removeFromBestMoments(moment);
			}
		}
		} //End of function(moment)d
		)).then(function() {
		return deferred.resolve(moments);
	});
		return deferred.promise;
};

function checkAndDeleteExpiredMoments(moments) {
	var deferred = $q.defer();
	console.log("CHECK AND DELETE EXPIRED MOMENTS");
	console.log(JSON.stringify(moments));
	var promises = [];
	currentTime = new Date().getTime(),
	timeBetweenMoments = constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_UNTIL_MOMENT_EXPIRES;

	for(var i = 0; i < moments.length; i++) {
		timeElapsed = moments[i].time;
		if(currentTime - timeBetweenMoments > timeElapsed) {
			removeMomentFromLocalStorage(moments[i]);
			promises.push(logger.logFile("Moment Expired - moment.checkAndDeleteExpiredMoment", {Moment: moments[i]}, {}, 'logs.txt'));
			promises.push(core.remove(moments[i]));
		}
	}
	Promise.all(promises).then(function() {
		deferred.resolve(moments);
	});
	return deferred.promise;
};

function addExtraClasses(moments) {
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
	var moments = JSON.parse(localStorage.getItem('moments'));
	moments.splice(moments.indexOf(moment), 1);
	localStorage.setItem('moments', JSON.stringify(moments));
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
			views: moments[i].views
		});
	}
	return temp;
};
	};
})();