(function() {
	angular.module('app.submitMomentService', [])

	.service('submitMomentService', ['core', 'constants', 'logger', '$q', 'localStorageManager', submitMomentService]);

	function submitMomentService(core, constants, logger, $q, localStorageManager){
		var dataURItoBlob = dataURItoBlob;
		this.uploadToAWS = uploadToAWS;
		this.uploadToLocalStorage = uploadToLocalStorage;
		this.updateTimeSinceLastMoment = updateTimeSinceLastMoment;
		this.dataURItoBlob = dataURItoBlob;

		function updateTimeSinceLastMoment() {
			localStorageManager.set('timeSinceLastMoment', new Date().getTime());
		};

		//Untested
		function uploadToAWS(media, moment) {
			core.aVideoIsUploading = true;
			var deferred = $q.defer();
			if(!(media.includes(".mp4"))) { //Its a picture
				console.log("EQEQW");
				var blob = new Blob([this.dataURItoBlob(media)], {type: 'image/jpeg'});
				core.upload(blob, moment).then(function() {
					deferred.resolve(moment);
					core.aVideoIsUploading = false;
				});
			} 
			else {
		        var xhr = new XMLHttpRequest();
		        xhr.open("GET", media);
		        xhr.responseType = "blob";
		        xhr.addEventListener('load', function() {
		            core.upload(xhr.response, moment).then(function() {
		            	deferred.resolve(moment);
		            });
		        });
		        xhr.send();

			}
			return deferred.promise;		
		};

		function uploadToLocalStorage(moment) {
			var localMoments = [];
			if(localStorageManager.get('myMoments')) {
				localMoments = localStorageManager.get('myMoments');
			}
			localMoments.push(moment);
			localStorageManager.set('myMoments',localMoments);
		};

		function dataURItoBlob(dataURI) {
		  var byteString = atob(dataURI.split(',')[1]);

	      // separate out the mime component 
	      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

	      // write the bytes of the string to an ArrayBuffer
	      var ab = new ArrayBuffer(byteString.length);
	      var ia = new Uint8Array(ab);
	      for (var i = 0; i < byteString.length; i++) {
	      	ia[i] = byteString.charCodeAt(i);
	      }

	      // write the ArrayBuffer to a blob, and you're done
	      var blob = new Blob([ab], {type: mimeString});
	      return blob;
	  };
};
})();