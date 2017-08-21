 (function() {
 	angular.module('core', [])

 	.service('core', ['$q', 'constants', 'awsServices', 'logger', 'geolocation', core]);

 	function core($q, constants, awsServices, logger, geolocation){
 		var vm = this,
 		deferred = $q.defer();
 		verifyMetaData = verifyMetaData;
 		vm.splitUrlOff = splitUrlOff;

 		vm.appInitialized = false;
 		vm.moments = [];
 		vm.timeElapsed = timeElapsed,
 		vm.getCurrentTime = getCurrentTime;
 		vm.getUUID = getUUID;
 		vm.didUserChangeRadius = false;
 		vm.currentLocation = "Could not find location";;

 		vm.remove = remove;
 		vm.edit = edit;
 		vm.upload = upload;
 		vm.uploadToBestMoments = uploadToBestMoments;
 		vm.removeFromBestMoments = removeFromBestMoments;
 		vm.getMoment = getMoment;
		vm.getMomentMetaData = getMomentMetaData;
		vm.listMoments = listMoments;
		vm.getLocation = getLocation;
		vm.locationNotFound = false;

		this.getLocation();

		function getLocation(location) {
			var deferred = $q.defer();
			if(!location) {
				geolocation.initializeUserLocation().then(function(location) {
					vm.currentLocation = location;
					vm.didUserChangeRadius = true;
					vm.locationNotFound = false;
					deferred.resolve(vm.currentLocation);
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					console.log(vm.currentLocation);
					vm.locationNotFound = true;
					deferred.reject();
				});
			}
			else if(!(/^\d+$/.test(location))) { //Does not contain digits
				geolocation.getCoordinatesFromTown(location).then(function(location) {
					console.log(location);
					vm.currentLocation = location;
					vm.didUserChangeRadius = true;
					geolocation.customLocation = location;
					geolocation.setMaxNESW(location.lat, location.lng);
					deferred.resolve(location);
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					deferred.reject(constants.LOCATION_NOT_FOUND_TXT);
				});
			}
			else { //It is a zip code
				geolocation.getCoordsFromZipCode(location).then(function(location) {
					vm.currentLocation = location;
					vm.didUserChangeRadius = true;
					geolocation.customLocation = location;
					geolocation.setMaxNESW(location.lat, location.lng);
					deferred.resolve(location);
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					deferred.reject(constants.LOCATION_NOT_FOUND_TXT);

				});
			}
			return deferred.promise;
		};

 		function splitUrlOff(key) {
 			var result = "";
 			if(key !== undefined && key.split("/").length > 3) {
 				var keySplit = key.split('/');
 				for(var i = 4; i < keySplit.length; i++) {
 					result = result + keySplit[i] + '/';
 				}
 				return result.substring(0, result.length-1);
 			}
 			else {
 				console.log("INVALID KEY");
 				console.log(key);
 				return key;
 			}
 		};

 		function remove(moment) {
 			console.log("CORE REMOVE");
 			var deferred = $q.defer();
 			if(moment.key !== undefined) {
 				var path = splitUrlOff(moment.key);
 			} else { //AWS S3 SDK returns a key with a capital 'K'
 				var path = moment.Key;
 			}
 			return awsServices.remove(path).then(function() {
 				 console.log("REMOVED...");
 				// deferred.resolve();
 			}, function(error) {
 				logger.logFile('aws_services.remove', {Path: path}, error, 'errors.txt').then(function() {
 					// deferred.reject(error);	
 				});
 			});
 			// return deferred.promise;
 		};

 		var verifyMetaData = function(moment) {
 			if(moment.key.includes('reports')) {
 				return true;
 			}
 			if(	moment.location &&
 				moment.likes &&
 				moment.description !== undefined &&
 				moment.time &&
 				moment.views &&
 				moment.uuids)
 				return true;
 			else {
 				logger.logFile('core.verifyMetaData', {Moment: moment}, error, 'errors.txt').then(function() {
 					return false;
 				});
 			}
 		}

 		function edit(moment){
 			var deferred = $q.defer();
 			var key = moment.key;
 			if(verifyMetaData(moment)) {
 				key = this.splitUrlOff(key);
 				awsServices.copyObject(key, key, moment, "REPLACE").then(function() {
 					deferred.resolve();
 				}, function(error) {
 					var parameters = {
 						Key: key,
 						CopySource: key,
 						MetaData: moment,
 						Directive: "REPLACE"
 					};
 					console.log("ERROR");
 					console.log(error);
 					console.log(parameters);
					// error = "FAILURE - aws_services.copyObject" + "\r\n" + "KEY: " + key + " | copySource: " + copySource + " | META DATA: " + metaData + " | DIRECTIVE: " + directive + "\r\n" + error;
					logger.logFile("aws_services.copyObject", parameters, error, 'errors.txt').then(function() {
						deferred.reject(error);	
					});
				});
 			}
 			else {
 				deferred.reject();
 			}
 			return deferred.promise;
 		};

 		function upload(file, moment) {
  			var deferred = $q.defer();
 			if(!moment.key.includes(".txt") && !moment.key.includes("_")) {
 				console.log("zxcvzxcvzxc");
 				moment.key = moment.key + "_" + new Date().getTime() + ".jpg";
 			}
 			if(verifyMetaData(moment)) {
 				var key = splitUrlOff(moment.key);
 				console.log("KEY");
 				console.log(key);
 				awsServices.upload(file, key, moment).then(function() {
 					deferred.resolve();
 				}, function(error) {
 					var parameters = {
 						File: file,
 						Key: key,
 						Moment: moment
 					}
 					logger.logFile("aws_services.upload", parameters, error, 'errors.txt').then(function() {
 						deferred.reject(error);	
 					});
 				});
 			}
 			else {
 				deferred.reject("invalid MetaData");
 			}
 			return deferred.promise;
 		};

 		function uploadToBestMoments(moment) {
 			var copySource = this.splitUrlOff(moment.key);
			var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
			// var log = "New BestMoment - moment.uploadToBestMoments" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
			logger.logFile("New BestMoment - moment.uploadToBestMoments", {Moment: moment}, {}, 'logs.txt')
				.then(function() {
					var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
					moment.key = moment.key.replace('moments/.../', "bestMoments/");
					awsServices.copyObject(key, copySource, moment, "REPLACE");
				});
 		};

 		function removeFromBestMoments(moment) {
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX, '').then(function(bestMoments) {
				// bestMoments.splice(0, 1); //The first key listed is always the folder, skip that.
				for(var i = 0; i < bestMoments.length; i++){
					var bestMomentKey = bestMoments[i].Key.split('/');
					var momentKey = moment.key.split('/');
					bestMomentKey = bestMomentKey[bestMomentKey.length - 1];
					momentKey = momentKey[momentKey.length - 1];
					console.log("TEST");
					if(bestMomentKey === momentKey) {
						vm.remove(bestMoments[i]);
					}
				}
			});
 		};
 		function listMoments(prefix, startAfter) {
 			// var deferred = $q.defer();
 			var promises = [];
 			return awsServices.getMoments(prefix, startAfter).then(function(moments) {
 				for(var i = 0; i < moments.length; i++) {
 					// moments[i].Key = constants.IMAGE_URL + moments[i].Key;
 					promises.push(getMomentMetaData(moments[i]));
 				}
 			return $q.all(promises);
 			});
 		};
 		function getMoment(moment){
 			return awsServices.getObject(splitUrlOff(moment.key)).then(function(moment) {
 				console.log("TREWREW");
 				console.log(moment);
 				if(moment !== "Not Found") {
 					return moment.MetaData;
 				} else {
 					return moment;
 				}
 			});
 		};

 		function getMomentMetaData(moment) {
 			console.log("META DATA 3");
 			console.log(moment.Key);
 			return awsServices.getMomentMetaData(moment.Key);
 		};

 		function getCurrentTime() {
 			return new Date().getTime();
 		};

 		function timeElapsed(time) {
			if(time.toString().match(/[a-z]/i)) { //It is already in the correct format
				return time;
			}
			time = parseInt(time);

			var currentTime = new Date().getTime();
			var minute = 60;
			var hour = 3600;
			var day = 86400;
			var counter = 0;
			var timeElapsed = Math.abs(currentTime - time);
			timeElapsed = timeElapsed / 1000;
		//How many days are in timeElasped?
		for(var i = timeElapsed; i > day; i = i - day) {
			counter++;
		}
		day = counter;
		counter = 0;
		if(day >= 1) {
			return day + "d";
		}

		for(var i = timeElapsed; i > hour; i = i - hour) {
			counter++;
		}
		hour = counter;
		counter = 0;
		if(hour >= 1) {
			return hour + "h";
		}

		for(var i = timeElapsed; i > minute; i = i - minute) {
			counter++;
		}
		minute = counter;
		counter = 0;
		if(minute >= 1) {
			return minute + "m";
		}
		else {
			return "0m"
		}
	};

	function getUUID() {
		// return window.device.uuid;
		if(constants.DEV_MODE) {
			return "123"; //Temporary	
		} else {
			return window.device.uuid;
		}
	};
}
})();