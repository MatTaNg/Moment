(function() {

  angular.module('app.IndexController', [])

  .controller('IndexController', ['$timeout', 'core', '$rootScope', '$scope', '$stateParams', '$state', '$q', 'core', '$location', '$ionicContentBanner', 'constants', '$rootScope', '$interval', 'logger', '$sce', '$ionicPopup', 'localStorageManager', IndexController]);
  
  function IndexController($timeout, core, $rootScope, $scope, $stateParams, $state, $q, core, $location, $ionicContentBanner, constants, $rootScope, $interval, logger, $sce, $ionicPopup, localStorageManager) {
    var indexController = this,
    enoughTimePassedBetweenMoments = enoughTimePassedBetweenMoments;
    indexController.camera = camera;
    indexController.gallery = gallery;
    indexController.video = video;
    indexController.openDialog = openDialog;
    indexController.contentBanner = undefined;

    indexController.myMomentsLogo = "ion-ios-person-outline";
    indexController.uploadLogo = "ion-ios-upload-outline";

    $rootScope.$on('myMomentLogo', function(event, data) {
      indexController.myMomentsLogo = data;
    });

    $rootScope.$on('uploadLogo', function(event, data) {
      indexController.uploadLogo = data;
    });
    
    $rootScope.$on('$locationChangeStart', function(next, current) {
      if(core.aVideoIsUploading) {
          $timeout(function() {
            if(indexController.contentBanner) {
              indexController.contentBanner();
              indexController.contentBanner = null;
            }
            indexController.contentBanner = $ionicContentBanner.show({
              text: ["Uploading, please do not close the app"],
              transition: "none"
            });
            
          }, 500);
      }
     });

    $rootScope.$on('upload start', function(event, args) {
          $timeout(function() {
            if(indexController.contentBanner) {
              indexController.contentBanner();
              indexController.contentBanner = null;
            }
            indexController.contentBanner = $ionicContentBanner.show({
              text: ["Uploading, please do not close the app"],
              transition: "none"
            });
          }, 500);
          
    });

    $rootScope.$on('upload complete', function(event, args) {
           if(indexController.contentBanner) {
              indexController.contentBanner();
              indexController.contentBanner = null;
            }
          indexController.contentBanner = $ionicContentBanner.show({
            text: ["Upload Complete"],
            autoClose: 5000,
            transition: "none"
          });
    });

    function openDialog() {
      $ionicPopup.show({
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            type: 'button-assertive'
          },
          {
            text: 'Camera',
            type: 'button-energized',
            onTap: function(e) {
              camera();
            }            
          },
          {
            text: 'Video',
            type: 'button-calm',
            onTap: function(e) {
              video();
            }
          }
        ]
      });
    };

    function video() {
      navigator.device.capture.captureVideo(onSuccess, onFail, 
        {
          limit: 1,
          duration: constants.MAX_DURATION_OF_VIDEO
        });
      function onSuccess(mediaFiles) {
        var i, path, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            path = mediaFiles[i].fullPath;
            console.log(path);
            $state.go('submitMoment', {media: $sce.trustAsResourceUrl(path)});
        }
      };

      function onFail(message) {
        console.log("FAILED because: " + message);
      };
    };

    function camera() { 
      navigator.camera.getPicture(onSuccess, onFail, 
          { quality: 100, //Quality of photo 0-100
          destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
          allowEdit: true, //Allows editing of picture
          targetWidth: 300,
          targetHeight: 300
        });

      function onSuccess(imageURI) {
        var picture = "data:image/jpeg;base64," + imageURI;
        $state.go('submitMoment', {media: picture});
      };

      function onFail(message) {
        console.log('Failed because: ' + message);
        if(message !== "Camera cancelled") {
          logger.logFile('camera.onFail', '', message, error);
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
        $state.go('submitMoment', {media: picture});
      }

      function onFail(message) {
        console.log("Failed because: " + message);
        logger.logFile('camera.onFail', '', message, error);
      }
    };
    $interval(function() {
      $scope.momentTimer = "0m";
      if(!constants.DEV_MODE) {
        if(!localStorageManager.get('timeSinceLastMoment')) {
          var currentTime = new Date().getTime();
          var timeUntilNextMoment = parseInt(localStorageManager.get('timeSinceLastMoment')) + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
          var timeLeft = timeUntilNextMoment - currentTime;
          console.log("TEST");
          console.log(localStorageManager.get('timeSinceLastMoment'));
          console.log(timeLeft);
          $scope.momentTimer = core.timeElapsed(currentTime + timeLeft);
          if(currentTime > timeUntilNextMoment) {
            $scope.momentTimer = "0m";
          }
        }
      }
    }, 500);
  };
})();