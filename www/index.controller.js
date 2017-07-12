(function() {

  angular.module('app.IndexController', [])

  .controller('IndexController', ['$scope', '$stateParams', '$state', '$q', 'core', '$location', '$ionicContentBanner', 'constants', '$rootScope', '$interval', 'logger', IndexController]);
  
  function IndexController($scope, $stateParams, $state, $q, core, $location, $ionicContentBanner, constants, $rootScope, $interval, logger) {
    var indexController = this,
    enoughTimePassedBetweenMoments = enoughTimePassedBetweenMoments;
    indexController.camera = camera;
    indexController.gallery = gallery;

    indexController.myMomentsLogo = "ion-ios-person-outline";
    indexController.uploadLogo = "ion-ios-upload-outline";

    $rootScope.$on('myMomentLogo', function(event, data) {
      indexController.myMomentsLogo = data;
    });

    $rootScope.$on('uploadLogo', function(event, data) {
      indexController.uploadLogo = data;
    });

    function camera() { 
      alert("CAMERA CALLED");
      navigator.camera.getPicture(onSuccess, onFail, 
          { quality: 100, //Quality of photo 0-100
          destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
          allowEdit: true, //Allows editing of picture
          targetWidth: 300,
          targetHeight: 300
        });

      function onSuccess(imageURI) {
        alert("SUCCESS");
        var picture = "data:image/jpeg;base64," + imageURI;
        $state.go('submitMoment', {picture: picture});
      };

      function onFail(message) {
        alert("FAILED");
        alert(message);
        console.log("Fail");
        console.log('Failed because: ' + message);
        if(message !== "Camera cancelled") {
          $ionicContentBanner.show({
              text: ["Something went wrong"],
              type: "error",
              autoClose: 3000
            });
          logger.logFile(camera.onFail, '', message, error);
        }
      }
    };

    function gallery() {
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
        $state.go('submitMoment', {picture: picture});
      }

      function onFail(message) {
        console.log("Failed because: " + message);
        $ionicContentBanner.show({
            text: ["Something went wrong"],
            type: "error",
            autoClose: 3000
          });
      }
    };
    $interval(function() {
      $scope.momentTimer = "0m";
      if(!constants.DEV_MODE) {
        if(localStorage.getItem('timeSinceLastMoment')) {
          var currentTime = new Date().getTime();
          var timeUntilNextMoment = parseInt(localStorage.getItem('timeSinceLastMoment')) + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
          var timeLeft = timeUntilNextMoment - currentTime;
          $scope.momentTimer = core.timeElapsed(currentTime + timeLeft);
          if(currentTime > timeUntilNextMoment) {
            $scope.momentTimer = "0m";
          }
        }
      }
    }, 500);
  };
})();