(function() {
	angular.module('app.submitMomentService', [])

	.service('submitMomentService', ['core', 'constants', submitMomentService]);

	function submitMomentService(core, constants){
		var dataURItoBlob = dataURItoBlob;
		this.uploadToAWS = uploadToAWS;
		this.uploadToLocalStorage = uploadToLocalStorage;
		this.updateTimeSinceLastMoment = updateTimeSinceLastMoment;

		function updateTimeSinceLastMoment() {
			localStorage.setItem('timeSinceLastMoment', new Date().getTime());
		};

		function uploadToAWS(picture, moment) {
			var blob = new Blob([dataURItoBlob(picture)], {type: 'image/jpeg'});
			var file = new File([blob], moment.location);
			return core.upload(file, moment);
		};

		function uploadToLocalStorage(moment) {
			moment.key = constants.IMAGE_URL + moment.key;
			var localMoments = [];
			if(JSON.parse(localStorage.getItem('myMoments')).length > 0) {
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