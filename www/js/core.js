 (function() {
 	angular.module('core', [])

 	.service('core', ['$rootScope', '$q', 'constants', 'awsServices', 'logger', 'notificationManager', core]);

 	function core($rootScope, $q, constants, awsServices, logger, notificationManager){
 		var vm = this;
 		vm.verifyMetaData = verifyMetaData;
 		vm.splitUrlOff = splitUrlOff;
 		vm.remove = remove;
 		vm.edit = edit;
 		vm.upload = upload;
 		vm.uploadToBestMoments = uploadToBestMoments;
 		vm.removeFromBestMoments = removeFromBestMoments;
 		vm.getMoment = getMoment;
		vm.getMomentMetaData = getMomentMetaData; 
		vm.listMoments = listMoments;
		vm.listComments = listComments;
		vm.finishedVideoUpload = finishedVideoUpload;
		vm.populateMomentObj = populateMomentObj;
		vm.getComment = getComment;

 		vm.appInitialized = false;
 		vm.moments = [];
 		vm.convertTimeToMiliSeconds = convertTimeToMiliSeconds,
 		vm.timeElapsed = timeElapsed,
 		vm.getCurrentTime = getCurrentTime;
 		vm.getUUID = getUUID;
		vm.aVideoIsUploading = false;

		function populateMomentObj(moment) {
			return {
				key: moment.key,
				description: moment.description,
				likes: moment.likes,
				location: moment.location,
				time: moment.time,
				uuids: moment.uuids,
				views: moment.views,
				media: moment.media,
				nativeurl: moment.nativeurl,
				onesignalid: moment.onesignalid,
				bestmoment: moment.bestmoment,
				commentids: moment.commentids,
				comments: moment.comments
			};
		};

		function finishedVideoUpload() {
			vm.aVideoIsUploading = false;
			$rootScope.$emit("upload complete");
		};

		function showVideoBanner() {
			vm.aVideoIsUploading = true;
			$rootScope.$emit("upload start");
		}

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
 				return key;
 			}
 		};

 		function remove(moment) {
 			var deferred = $q.defer();
 			if(moment.key !== undefined) {
 				var key = splitUrlOff(moment.key);
 			} else { //AWS S3 SDK returns a key with a capital 'K'
 				var key = moment.Key;
 			}
 			return awsServices.remove(key);
 		};

 		function verifyMetaData(moment) {
 			if(!moment.key) {
 				return false;
 			}
 			if(moment.key.includes('reports')) {
 				return true;
 			}

 			if(	moment.key !== undefined &&
 				moment.location !== undefined &&
 				moment.likes !== undefined &&
 				moment.description !== undefined &&
 				moment.time !== undefined &&
 				moment.views !== undefined &&
 				moment.uuids !== undefined &&
 				moment.media !== undefined &&
 				// moment.nativeurl !== undefined &&
 				moment.commentids !== undefined)
 				return true; 
 			else { 
 				// var error = [];
 				// for(var property in moment) {
 				// 	console.log("PROPERTY");
 				// 	console.log(property);
 				// 	console.log(moment);
 				// 	console.log(moment.key);z
 				// 	console.log(moment.property);
					//   if (moment.hasOwnProperty(property)) {
					//   	if(!moment.property) {
					//   		error.push(property);
					//   	}
					//   }
					// }
 				logger.logFile('core.verifyMetaData', {Moment: moment}, '', 'errors.txt');
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
 
 		function isValidMimeType(mimeType) {
 			return (mimeType === "text/plain" ||
 					mimeType === "video/mp4" ||
 					mimeType === "image/jpg" ||
 					mimeType === "application/json");
 		}

 		function upload(file, moment, mimeType) {
 			var deferred = $q.defer();
 			if(isValidMimeType(mimeType)) {
	 			showVideoBanner();
	 			if(!moment.key.includes(".txt") && !moment.key.includes("_")) {
	 				moment.key = moment.key + "_" + new Date().getTime() + ".jpg";
	 			}
	 			if(verifyMetaData(moment)) {
	 				var key = splitUrlOff(moment.key);
	 				if(mimeType === "video/mp4") {
	 					//Its a video
	 					if(file.byteLength > 1024 * 1024 * 5) {
	 						awsServices.multiPartUpload(file, key, moment).then(function() {
	 							finishedVideoUpload();
	 							deferred.resolve();
	 						});
	 					}
	 					else {
	 						//Its a small video
	 						return awsServices.upload(file, key, moment, "video/mp4").then(function() {
	 							finishedVideoUpload();
	 							deferred.resolve();
	 						});
	 					}
	 				}
	 				else {
	 					//Its a picture
		 				awsServices.upload(file, key, moment, "image/jpg")
			 				.then(function() {
			 					finishedVideoUpload();
			 					deferred.resolve();
			 				}, function(error) {
			 					deferred.reject();
			 				});
		 			}
	 			}
	 			else {
	 				//Its a comment
					// var blob = new Blob([JSON.stringify(moment)], {type: 'text/plain'});
					awsServices.upload(file, key, {}, 'text/plain').then(function() {
						deferred.resolve();
					});
	 				// deferred.reject("invalid MetaData");
	 			}
	 		}
	 		else {
	 			deferred.reject("Invalid Mime Type");
	 		}
 			return deferred.promise;
 		};

 		function uploadToBestMoments(moment) {
 			var momentKey = moment.key;
 			var copySource = this.splitUrlOff(moment.key);
			var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
			var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
			if(!moment.bestmoment) {
				moment.bestmoment = "true";
			}
			awsServices.copyObject(copySource, copySource, moment, "REPLACE").then(function() {
				moment.key = moment.key.replace(/\/moment\/../, "/bestMoments");
				awsServices.copyObject(key, copySource, moment, "REPLACE");
				notificationManager.notifyUploadToBestMoments(moment.onesignalid, constants.MOMENT_BECOMES_BEST_MOMENT);	
			});
 		};

 		function removeFromBestMoments(moment) {
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX, '').then(function(bestMoments) {
				for(var i = 0; i < bestMoments.length; i++){
					var bestMomentKey = bestMoments[i].Key.split('/');
					var momentKey = moment.key.split('/');
					bestMomentKey = bestMomentKey[bestMomentKey.length - 1];
					momentKey = momentKey[momentKey.length - 1];
					if(bestMomentKey === momentKey) {
						vm.remove(bestMoments[i]);
						awsServices.getMomentMetaData(splitUrlOff(moment.key)).then(function (metaData) {
							delete metaData.bestmoment;
							awsServices.copyObject(splitUrlOff(moment.key), splitUrlOff(moment.key), metaData, "REPLACE").then(function() {
							});
						});
					}
				}
			});
 		};
 		function listMoments(prefix, startAfter, maxKeys) {
 			var promises = [];
 			return awsServices.getMoments(prefix, startAfter, maxKeys).then(function(moments) {
 				for(var i = 0; i < moments.length; i++) {
 					moments[i].key = moments[i].Key;
 					// moments[i].Key = constants.IMAGE_URL + moments[i].Key;
 					promises.push(getMomentMetaData(moments[i]));
 				}
 			return $q.all(promises);
 			});
 		};

 		function listComments(prefix, startAfter, maxKeys) {
 			var promises = [];
 			return awsServices.getMoments(prefix, startAfter, maxKeys);
 		};

 		function getMoment(moment){
			key = splitUrlOff(moment.key)
 			return awsServices.getObject(key).then(function(moment) {
 				if(moment !== "Not Found") {
 					return moment.Metadata;
 				} else {
 					return moment;
 				}
 			});
 		};

 		function getComment(key){
 			return awsServices.getObject(key);
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

		function convertTimeToMiliSeconds(time) {
			time = time.toString();
			time = time.toLowerCase();
			var result = new Date().getTime();
			var temp =  time.slice(0, -1);
			if(time.includes('m')) {
				return result - temp * 60000;
			}
			if(time.includes('h')) {
				return result - temp * 3600000;
			}
			if(time.includes('d')) {
				return result - temp * 86400000;
			}
			else {
				return time;
			}
		};

 		function timeElapsed(time, returnTimeUntilMomentExpires) {
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
			if(returnTimeUntilMomentExpires === true) {
				timeElapsed = constants.HOURS_UNTIL_MOMENT_EXPIRES * constants.MILISECONDS_IN_AN_HOUR - timeElapsed;
			}
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