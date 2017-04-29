 (function() {
 	angular.module('core', [])

 	.service('core', ['$cordovaGeolocation', '$q', '$http', 'constants', 'awsServices', 'logger', 'geolocation', core]);

 	function core($cordovaGeolocation, $q, $http, constants, awsServices, logger, geolocation){
 		var vm = this,
 		deferred = $q.defer();

		verifyMetaData = verifyMetaData;
		vm.splitUrlOff = splitUrlOff;

		vm.userLocation = undefined;
		vm.moments = [];

		vm.timeElapsed = timeElapsed,
		vm.getCurrentTime = getCurrentTime;
		vm.getUUID = getUUID;
		vm.getHardCodedMoments = getHardCodedMoments;

		vm.remove = remove;
		vm.edit = edit;
		vm.upload = upload;

		function splitUrlOff(key) {
			var result = "";
			var keySplit = key.split('/');
			if(keySplit.length > 4) {
				for(var i = 4; i < keySplit.length; i++) {
					result = result + keySplit[i] + '/';
				}
				return result.substring(0, result.length-1);
			}
			else {
				return key;
			}
		};

		function remove(moment) {
			var deferred = $q.defer();
			var path = splitUrlOff(moment.key);
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
						CopySource: copySource,
						MetaData: metaData,
						Directive: directive
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
					delete moment.key;
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

//DEV MODE
function getHardCodedMoments() {
	var key = "test/PA/"
	var temp = [];
	return awsServices.getMoments(key).then(function(moments) {
		moments.splice(0,1);
		return Promise.all(moments.map(moment =>
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
	});
};

function getUUID() {
		// console.log("window.device.uuid");
		// console.log(window.device.uuid);
		// return window.device.uuid;
		return "123"; //Temporary
	};

};
})();