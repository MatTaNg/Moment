(function() {
 	angular.module('downloadManager', [])

 	.service('downloadManager', ['constants', '$sce', '$cordovaFile', '$cordovaFileTransfer', 'logger', '$q', downloadManager]);

 	function downloadManager(constants, $sce, $cordovaFile, $cordovaFileTransfer, logger, $q){
 		var vm = this;
		vm.downloadFiles = downloadFiles;
		vm.downloadToDevice = downloadToDevice;

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
			moments = [].concat(moments || []);
			var deferred = $q.defer();
			var x = 0;
			var downloaded_Moments = []; 
			if(constants.DEV_MODE) {
				return $q.resolve(moments);
			}
			if(cordova.file && moments) {
				async.each(moments, function(moment, callback) {
					var temp = moment.key.split("/");
					uniqueKey = temp[temp.length - 1];
					var fileURL = cordova.file.externalDataDirectory + 'moments' + new Date().getTime() + '/';
					$cordovaFileTransfer.download(moment.key, fileURL, {}, true).then(function(result) {
						moment.nativeurl = result.nativeURL;
						downloaded_Moments.push(moment);
						callback();
					}, function(error) {
						callback();
					});
				}, function(error) {
					if(error) {
						var parameters = {
							moments: moments,
						}
						deferred.reject();
					}
					deferred.resolve(downloaded_Moments);
				});
			} else {
				var parameters = {
					moments: moments,
					cordovaFile: cordova.file
				}
				logger.logFile("downloadManager.downloadFiles", parameters, 'Problem with moments or cordova.file', 'errors.txt');
				deferred.reject();
			}
			return deferred.promise;
		};
	}
})();