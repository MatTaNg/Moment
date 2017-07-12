 (function() {
 	angular.module('core', [])

 	.service('core', ['$cordovaGeolocation', '$q', '$http', 'constants', 'awsServices', 'logger', 'geolocation', core]);

 	function core($cordovaGeolocation, $q, $http, constants, awsServices, logger, geolocation){
 		var vm = this,
 		deferred = $q.defer();
console.log("CORE");
 		verifyMetaData = verifyMetaData;
 		vm.splitUrlOff = splitUrlOff;

 		vm.appInitialized = false;
 		vm.moments = [];
 		vm.timeElapsed = timeElapsed,
 		vm.getCurrentTime = getCurrentTime;
 		vm.getUUID = getUUID;
 		vm.didUserChangeRadius = false;
 		vm.currentLocation = "";

 		vm.remove = remove;
 		vm.edit = edit;
 		vm.upload = upload;
 		vm.uploadToBestMoments = uploadToBestMoments;
 		vm.removeFromBestMoments = removeFromBestMoments;
 		vm.getMoment = getMoment;
		vm.getMomentMetaData = getMomentMetaData;
		vm.listMoments = listMoments;
		
		geolocation.initializeUserLocation().then(function(location) {
				vm.currentLocation = location.town;
				console.log(vm.currentLocation);
			}, function(error) {
				console.log("ERROR");
				console.log(error);
				vm.currentLocation = "Could not find location";
			});
		};

 		function splitUrlOff(key) {
 			var result = "";
 			console.log("IRL KEY");
 			console.log(JSON.stringify(key));
 			if(key !== undefined) {
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
 			var deferred = $q.defer();
 			if(moment.key !== undefined) {
 				var path = splitUrlOff(moment.key);
 			} else { //AWS S3 SDK returns a key with a capital 'K'
 				var path = moment.Key;
 			}
 			awsServices.remove(path).then(function() {
 				deferred.resolve();
 			}, function(error) {
 				logger.logFile('aws_services.remove', {Path: path}, error, 'errors.txt').then(function() {
 					deferred.reject(error);	
 				});
 			});
 			return deferred.promise;
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
 				key = splitUrlOff(key);
 				awsServices.copyObject(key, key, moment, "REPLACE").then(function() {
 					deferred.resolve();
 				}, function(error) {
 					var parameters = {
 						Key: key,
 						CopySource: key,
 						MetaData: moment,
 						Directive: "REPLACE"
 					};
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
 				moment.key = moment.key + "_" + new Date().getTime() + ".jpg";
 			}
 			if(verifyMetaData(moment)) {
 				var key = splitUrlOff(moment.key);
 				awsServices.upload(file, key, moment).then(function() {
 					deferred.resolve();
 				},function(error) {
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
 			var copySource = splitUrlOff(moment.key);
			var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
			// var log = "New BestMoment - moment.uploadToBestMoments" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
			logger.logFile("New BestMoment - moment.uploadToBestMoments", {Moment: moment}, {}, 'logs.txt')
				.then(function() {
					var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
					moment.key = moment.key.replace('moments/.../', "bestMoments/");
					console.log(moment.key);
					awsServices.copyObject(key, copySource, moment, "REPLACE");
				});
 		};

 		function removeFromBestMoments(moment) {
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX, '').then(function(bestMoments) {
				moments.splice(0, 1); //The first key listed is always the folder, skip that.
				for(var i = 0; i < bestMoments.length; i++){
					var bestMomentKey = bestMoments[i].Key.split('/');
					var momentKey = moment.key.split('/');
					bestMomentKey = bestMomentKey[bestMomentKey.length - 1];
					momentKey = momentKey[momentKey.length - 1];
					if(bestMomentKey === momentKey) {
						remove(bestMoments[i]);
					}
				}
			});
 		};

 		function getMoment(moment){
 			return awsServices.getObject(splitUrlOff(moment.key));
 		};

 		function getMomentMetaData(moment) {
 			return awsServices.getMomentMetaData(moment.Key);
 		}

 		function listMoments(prefix, startAfter) {
 			return awsServices.getMoments(prefix, startAfter)
 		}

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
})();