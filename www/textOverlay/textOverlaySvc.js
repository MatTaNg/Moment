angular.module('app.textOverlaySvc', [])

.service('textOverlaySvc', ['coreSvc', function(coreSvc){

	this.uploadToAWS = function(picture, metaData) {
		var blob = new Blob([dataURItoBlob(picture)], {type: 'image/jpeg'});
		var file = new File([blob], metaData.location + '.jpeg');
		var filePath = coreSvc.getMomentPrefix() + metaData.location;
		coreSvc.upload(file, filePath, metaData);
	};

	this.uploadToLocalStorage = function(picture, metaData) {
		var momentData = {  
			key: picture,
			location: metaData.location,
			likes: metaData.likes,
			description: metaData.description,
			time: metaData.time
		};
		var localMomenets = [];
		if(localStorage.getItem('myMoments') != null) {
			localMomenets = JSON.parse(localStorage.getItem('myMoments'));
		}
		localMomenets.push(momentData);
		localStorage.setItem('myMoments', JSON.stringify(localMomenets));
	};

	var dataURItoBlob = function(dataURI) {
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
      alert(blob);
      return blob;
  }

}]);