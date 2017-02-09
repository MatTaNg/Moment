angular.module('app.mainCtrl', [])

.controller('mainCtrl', ['$scope', '$stateParams', '$state', '$q', 'coreSvc',
  function ($scope, $stateParams, $state, $q, coreSvc, $jrCrop) {

    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height * 0.5;
    var metaData = {location: "XYZ",
    likes: "0",
    time: "123",
    UUIDs: "QWERT"};

    var s3 = coreSvc.initiateBucket();

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

    $scope.camera = function() { 
      navigator.camera.getPicture(onSuccess, onFail, 
      { quality: 100, //Quality of photo 0-100
      destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
      allowEdit: false, //Allows editing of picture
      targetWidth: 300,
      targetHeight: 300,
      correctOrientation: true
    });

      function onSuccess(imageURI) {
        var blob = new Blob([dataURItoBlob("data:image/jpeg;base64," + imageURI)], {type: 'image/jpeg'});
        var file = new File([blob], metaData.location + '.jpeg');
        coreSvc.upload(file, metaData);
      };

      function onFail(message) {
        console.log("Fail");
        console.log('Failed because: ' + message);
      }
    };

    $scope.gallery = function() {
      navigator.camera.getPicture(onSuccess, onFail, {
      quality: 100, //Quality of photo 0-100
      destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true, //Allows editing of picture
      targetWidth: 300,
      targetHeight: 300,
      correctOrientation: true
    });

      function onSuccess(imageURI) {

          console.log("SUCCESSFUL");
          var blob = new Blob([dataURItoBlob("data:image/jpeg;base64," + imageURI)], {type: 'image/jpeg'});
          var file = new File([blob], metaData.location + '.jpeg');
          coreSvc.upload(file, metaData);

}

function onFail(message) {
  console.log("Failed because: " + message);
}
};

}])
