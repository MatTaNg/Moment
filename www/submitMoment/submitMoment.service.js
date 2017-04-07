(function() {
	angular.module('app.submitMomentService', [])

	.service('submitMomentService', ['core', 'constants', submitMomentService]);

	function submitMomentService(core, constants){
		var dataURItoBlob = dataURItoBlob;
		this.uploadToAWS = uploadToAWS;
		this.uploadToLocalStorage = uploadToLocalStorage;
		this.updateTime = updateTime;

		function updateTime() {
			localStorage.setItem('timeSinceLastMoment', new Date().getTime());
		};

		function uploadToAWS(key, picture, metaData) {
			console.log("SADSADSASA");
			console.log(key);
			var blob = new Blob([dataURItoBlob(picture)], {type: 'image/jpeg'});
			var file = new File([blob], metaData.location);
			return core.upload(file, key, metaData);
		};

		function uploadToLocalStorage(path, metaData) {
			var momentData = {  
				key: constants.IMAGE_URL + path,
				location: metaData.location,
				likes: metaData.likes,
				description: metaData.description,
				time: core.timeElapsed(metaData.time)
			};
			var localMomenets = [];
			if(localStorage.getItem('myMoments') != null) {
				localMomenets = JSON.parse(localStorage.getItem('myMoments'));
			}
			localMomenets.push(momentData);
			localStorage.setItem('myMoments', JSON.stringify(localMomenets));
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