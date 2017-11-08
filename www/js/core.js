 (function() {
 	angular.module('core', [])

 	.service('core', ['$cordovaFile', '$cordovaFileTransfer', '$rootScope', '$q', 'constants', 'awsServices', 'logger', 'geolocation', core]);

 	function core($cordovaFile, $cordovaFileTransfer, $rootScope, $q, constants, awsServices, logger, geolocation){
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
 		vm.currentLocation = "Could not find location";

 		vm.remove = remove;
 		vm.edit = edit;
 		vm.upload = upload;
 		vm.uploadToBestMoments = uploadToBestMoments;
 		vm.removeFromBestMoments = removeFromBestMoments;
 		vm.getMoment = getMoment;
		vm.getMomentMetaData = getMomentMetaData; 
		vm.listMoments = listMoments;
		vm.getLocation = getLocation;
		vm.finishedVideoUpload = finishedVideoUpload;
		vm.downloadFiles = downloadFiles;
		vm.downloadToDevice = downloadToDevice;
		vm.locationNotFound = false;
		vm.aVideoIsUploading = false;

		function finishedVideoUpload() {
			vm.aVideoIsUploading = false;
			$rootScope.$emit("upload complete");
		};

		function showVideoBanner() {
			vm.aVideoIsUploading = true;
			$rootScope.$emit("upload start");
		}

		function downloadToDevice(momentNativeURL) {
			 if (ionic.Platform.isIOS()) {
				 var path = cordova.file.documentsDirectory;
				 var filename = "preview.mp4";
			 } else {
				 var path = cordova.file.externalRootDirectory;
				 var filename = "preview" + new Date().getTime() + ".mp4";
			 }

			 $cordovaFile.createDir(path, "dir", true).then(function(success) {
				// var fileName = momentNativeURL.split("/").pop();
				var targetPath = path + "dir/" + filename;
				// var fileURL = cordova.file.externalDataDirectory + fileName;
				return $cordovaFileTransfer.download(momentNativeURL, targetPath, {}, true).then(function(result) {
				     if (ionic.Platform.isIOS()) {
			         function saveLibrary() {
			             cordova.plugins.photoLibrary.saveVideo(targetPath, album,     function(success) {}, function(err) {
			                 if (err.startsWith('Permission')) {
			                         cordova.plugins.photoLibrary.requestAuthorization(function() {
			                             saveLibrary();
			                         }, function(err) {
			                             $ionicLoading.hide();
			                             // $cordovaToast.show("Oops! unable to save video, please try after sometime.", "long", "center");
			                             // User denied the access
			                         }, // if options not provided, defaults to {read: true}.
			                         {
			                             read: true,
			                             write: true
			                         });
			                 }
			             });
			         }
			         saveLibrary()
				     } else {
				         //add refresh media plug in for refresh the gallery for android to see the downloaded video.
				         refreshMedia.refresh(targetPath);
				     }
				}, function(error) {
					var parameters = {
						momentNativeURL: momentNativeURL
					}
					logger.logFile("core.downloadToDevice", parameters, error, 'errors.txt');
				});
			 });
		};

		function downloadFiles(moments) {
			var deferred = $q.defer();
			var x = 0;
			var downloaded_Moments = []; 
			if(cordova.file && moments) {
				async.each(moments, function(moment, callback) {
					var temp = moment.key.split("/");
					uniqueKey = temp[temp.length - 1];
					var fileURL = cordova.file.externalDataDirectory + 'moments' + new Date().getTime() + '/';
					$cordovaFileTransfer.download(moment.key, fileURL, {}, true).then(function(result) {
						moment.nativeURL = result.nativeURL;
						downloaded_Moments.push(moment);
						callback();
					}, function(error) {
						var parameters = {
							moments: moments
						}
						logger.logFile("core.downloadFiles", parameters, error, 'errors.txt');
					});
				}, function(error) {
					if(error) {
						var parameters = {
							moments: moments,
						}
						logger.logFile("core.downloadFiles", parameters, error, 'errors.txt');
						deferred.reject();
					}
					deferred.resolve(downloaded_Moments);
				});
			} else {
				var parameters = {
					moments: moments,
				}
				logger.logFile("core.downloadFiles", parameters, error, 'errors.txt');
				deferred.reject();
			}
			return deferred.promise;
		}

		function getLocation(location) {
			var deferred = $q.defer();
			if(!constants.DEV_MODE) {
				if(!location) {
					geolocation.initializeUserLocation().then(function(location) {
						vm.currentLocation = location;
						vm.locationNotFound = false;
						deferred.resolve(vm.currentLocation);
					}, function(error) {
						vm.currentLocation.town = "Could not find location";
						vm.locationNotFound = true;
						deferred.reject();
					});
				}
				else if(!(/^\d+$/.test(location))) { //Does not contain digits
					geolocation.getCoordinatesFromTown(location).then(function(location) {
						vm.currentLocation = location;
						vm.didUserChangeRadius = true;
						geolocation.customLocation = location;
						geolocation.setMaxNESW(location.lat, location.lng);
						deferred.resolve(location);
					}, function(error) {
						vm.currentLocation.town = "Could not find location";
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
						vm.currentLocation.town = "Could not find location";
						deferred.reject(constants.LOCATION_NOT_FOUND_TXT);

					});
				}
			}
			else {
				vm.currentLocation = constants.MOCKED_COORDS;
				geolocation.setMaxNESW(vm.currentLocation.lat, vm.currentLocation.lng);
				deferred.resolve( constants.MOCKED_COORDS );
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
 			var deferred = $q.defer();
 			if(moment.key !== undefined) {
 				var path = splitUrlOff(moment.key);
 			} else { //AWS S3 SDK returns a key with a capital 'K'
 				var path = moment.Key;
 			}
 			return awsServices.remove(path);
 		};

 		var verifyMetaData = function(moment) {
 			if(moment.key.includes('reports')) {
 				return true;
 			}
 			if(	moment.location &&
 				moment.likes &&
 				moment.description !== undefined &&
 				moment.time !== undefined &&
 				moment.views &&
 				moment.uuids &&
 				moment.media)
 				return true;
 			else {
 				logger.logFile('core.verifyMetaData', {Moment: moment}, "", 'errors.txt');
 				return false;
 			}
 		}

 		function edit(moment){
 			var key = moment.key;
 			if(verifyMetaData(moment)) {
 				key = this.splitUrlOff(key);
 				return awsServices.copyObject(key, key, moment, "REPLACE");
 			} else {
 				return $q.reject();
 			}
 		};

 		function upload(file, moment) {
 			showVideoBanner();
  			var deferred = $q.defer();
 			if(!moment.key.includes(".txt") && !moment.key.includes("_")) {
 				moment.key = moment.key + "_" + new Date().getTime() + ".jpg";
 			}
 			if(verifyMetaData(moment)) {
 				var key = splitUrlOff(moment.key);
 				if(file instanceof ArrayBuffer) {
 					if(file.byteLength > 1024 * 1024 * 5) {
 						awsServices.multiPartUpload(file, key, moment).then(function() {
 							finishedVideoUpload();
 							deferred.resolve();
 						});
 					}
 					else {
 						return awsServices.upload(file, key, moment).then(function() {
 							finishedVideoUpload();
 							deferred.resolve();
 						});
 					}
 				}
 				else {
	 				awsServices.upload(file, key, moment)
		 				.then(function() {
		 					finishedVideoUpload();
		 					deferred.resolve();
		 				}, function(error) {
		 					deferred.reject();
		 				});
	 			}
 			}
 			else {
 				deferred.reject("invalid MetaData");
 			}
 			return deferred.promise;
 		};

 		function uploadToBestMoments(moment) {
 			var momentKey = moment.key;
 			var copySource = this.splitUrlOff(moment.key);
			var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
			// var log = "New BestMoment - moment.uploadToBestMoments" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
			logger.logFile("New BestMoment - moment.uploadToBestMoments", {Moment: moment}, {}, 'logs.txt');
			var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
			moment.key = moment.key.replace(/\/moment\/../, "/bestMoments");
			awsServices.getObject(key).then(function(data) { //Does this key already exist?
				if(data === "Not Found") {
					awsServices.copyObject(key, copySource, moment, "REPLACE");
				}
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
 					moments[i].key = moments[i].Key;
 					// moments[i].Key = constants.IMAGE_URL + moments[i].Key;
 					promises.push(getMomentMetaData(moments[i]));
 				}
 			return $q.all(promises);
 			});
 		};
 		function getMoment(moment){
 			return awsServices.getObject(splitUrlOff(moment.key)).then(function(moment) {
 				if(moment !== "Not Found") {
 					return moment.Metadata;
 				} else {
 					return moment;
 				}
 			});
 		};

 		function getMomentMetaData(moment) {
 			if(moment.Key)
 				return awsServices.getMomentMetaData(splitUrlOff(moment.Key));
 			if(moment.key)
 				return awsServices.getMomentMetaData(splitUrlOff(moment.key));
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
		// return new Date().getTime().toString();
		// return window.device.uuid;
		if(constants.DEV_MODE) {
			// return new Date().getTime().toString(); //Temporary	
			// return "123";
			return "a3052d4fa4ec79a5";
		} else {
			return window.device.uuid;
		}
	};
}
})();