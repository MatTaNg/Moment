(function() {
	angular.module('app.submitMomentService', [])

	.service('submitMomentService', ['core', 'constants', 'logger', submitMomentService]);

	function submitMomentService(core, constants, logger){
		var dataURItoBlob = dataURItoBlob;
		this.uploadToAWS = uploadToAWS;
		this.uploadToLocalStorage = uploadToLocalStorage;
		this.updateTimeSinceLastMoment = updateTimeSinceLastMoment;

		function updateTimeSinceLastMoment() {
			localStorage.setItem('timeSinceLastMoment', new Date().getTime());
		};

		//Untested
		function uploadToAWS(media, moment) {
			console.log("UPLOAD TOAWS");
			console.log(moment);
			if(typeof(media) === "string") { //Its a picture
				console.log("IF");
				var blob = new Blob([dataURItoBlob(media)], {type: 'image/jpeg'});
			} 
			else {
				console.log("ELSE");
				var blob = new Blob([media], {type: 'video/mp4'});
			}
			var file = new File([blob], "TEST.jpg");
			console.log("FILE");
			console.log(file);
			return core.upload(file, moment);
		};

		function uploadToLocalStorage(moment) {
			var localMoments = [];
			if(JSON.parse(localStorage.getItem('myMoments'))) {
				console.log("TEST");
				localMoments = JSON.parse(localStorage.getItem('myMoments'));
			}
			localMoments.push(moment);
			localStorage.setItem('myMoments', JSON.stringify(localMoments));
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