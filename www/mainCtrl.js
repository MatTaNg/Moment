angular.module('app.mainCtrl', [])

.controller('mainCtrl', ['$scope', '$stateParams', '$state', '$q', 'coreSvc',
  function ($scope, $stateParams, $state, $q, coreSvc, $jrCrop) {

    $scope.camera = function() { 
      navigator.camera.getPicture(onSuccess, onFail, 
      { quality: 100, //Quality of photo 0-100
      destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
      allowEdit: true, //Allows editing of picture
      targetWidth: 300,
      targetHeight: 300
    });

      function onSuccess(imageURI) {
        var picture = "data:image/jpeg;base64," + imageURI;
        $state.go('textOverlay', {picture: picture});
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
      targetHeight: 300
    });

      function onSuccess(imageURI) {
        var picture = "data:image/jpeg;base64," + imageURI;
        $state.go('textOverlay', {picture: picture});
}

function onFail(message) {
  console.log("Failed because: " + message);
}
};

}])
