 (function() {
 	angular.module('common', [])

 	.service('common', ['logger', 'notificationManager', 'awsServices', 'constants', common]);

 	function common(logger, notificationManager, awsServices, constants){
 		var vm = this;
 		vm.verifyMetaData = verifyMetaData;
 		vm.splitUrlOff = splitUrlOff;
 		vm.uploadToBestMoments = uploadToBestMoments;
 		vm.removeFromBestMoments = removeFromBestMoments;
		vm.populateMomentObj = populateMomentObj;
		vm.getComment = getComment;

 		vm.appInitialized = false;
 		vm.moments = [];
 		vm.convertTimeToMiliSeconds = convertTimeToMiliSeconds,
 		vm.timeElapsed = timeElapsed,
 		vm.getUUID = getUUID;
		vm.aVideoIsUploading = false;

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

 		function getComment(key){
 			return awsServices.getObject(key);
 		};

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
				onesignalid: moment.onesignalid,
				bestmoment: moment.bestmoment,
				commentids: moment.commentids,
				comments: moment.comments,
				creator: moment.creator
			};
		};

 		function removeFromBestMoments(moment) {
			awsServices.getMoments(constants.BEST_MOMENT_PREFIX, '').then(function(bestMoments) {
				for(var i = 0; i < bestMoments.length; i++){
					var bestMomentKey = bestMoments[i].key.split('/');
					var momentKey = moment.key.split('/');
					bestMomentKey = bestMomentKey[bestMomentKey.length - 1];
					momentKey = momentKey[momentKey.length - 1];
					if(bestMomentKey === momentKey) {
						awsServices.remove(bestMoments[i].key);
						awsServices.getMomentMetaData(moment.key).then(function (metaData) {
							delete metaData.bestmoment;
							awsServices.copyObject(moment.key, moment.key, metaData, "REPLACE");
						});
					}
				}
			});
 		};

 		function uploadToBestMoments(moment) {
 			var momentKey = moment.key;
 			var copySource = moment.key;
			var key = constants.BEST_MOMENT_PREFIX + moment.key.split('/')[moment.key.split('/').length - 1];
			var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
			if(!moment.bestmoment) {
				moment.bestmoment = "true";
			}
			awsServices.copyObject(copySource, copySource, moment, "REPLACE").then(function() {
				moment.key = moment.key.replace(/\/moment\/../, "/bestMoments");
				awsServices.getObject(key).then(function(data) {
					console.log("####");
					console.log(data);
					if(data === 'Not Found') {
						console.log("TERUE");
						notificationManager.notifyUploadToBestMoments(moment.onesignalid, constants.MOMENT_BECOMES_BEST_MOMENT);			
					}
				});
				awsServices.copyObject(key, copySource, moment, "REPLACE");
			});
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
 				return key;
 			}
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
				return false;
			}
		};  

}
})();