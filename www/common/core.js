 (function() {
 	angular.module('core', [])

 	.service('core', ['common', '$rootScope', '$q', 'constants', 'awsServices', 'logger', core]);

 	function core(common, $rootScope, $q, constants, awsServices, logger){
 		var vm = this;
 		vm.remove = remove;
 		vm.edit = edit;
 		vm.upload = upload;
 		vm.getMoment = getMoment;
		vm.getMomentMetaData = getMomentMetaData; 
		vm.listMoments = listMoments;
		vm.listComments = listComments;

 		vm.appInitialized = false;
 		vm.moments = [];
		vm.aVideoIsUploading = false;

		function finishedVideoUpload() {
			vm.aVideoIsUploading = false;
			$rootScope.$emit("upload complete");
		};

		function showVideoBanner() {
			vm.aVideoIsUploading = true;
			$rootScope.$emit("upload start");
		}

 		function remove(moment) {
 			var deferred = $q.defer();
 			if(moment.key !== undefined) {
 				var key = common.splitUrlOff(moment.key);
 			} else { //AWS S3 SDK returns a key with a capital 'K'
 				var key = moment.Key;
 			}
 			return awsServices.remove(key);
 		};

 		function edit(moment){
 			var key = moment.key;
 			if(common.verifyMetaData(moment)) {
 				key = common.splitUrlOff(key);
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
	 			if(common.verifyMetaData(moment)) {
	 				var key = common.splitUrlOff(moment.key);
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

 		function listMoments(prefix, startAfter, maxKeys) {
 			var promises = [];
 			return awsServices.getMoments(prefix, startAfter, maxKeys).then(function(moments) {
 				for(var i = 0; i < moments.length; i++) {
 					// moments[i].key = moments[i].Key;
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
			key = common.splitUrlOff(moment.key)
 			return awsServices.getObject(key).then(function(moment) {
 				if(moment !== "Not Found") {
 					return moment.Metadata;
 				} else {
 					return moment;
 				}
 			});
 		};

 		function getMomentMetaData(moment) {
 			// if(moment.Key)
 				return awsServices.getMomentMetaData(common.splitUrlOff(moment.key));
 			// if(moment.key)
 				// return awsServices.getMomentMetaData(common.splitUrlOff(moment.key));
 		};

}
})();