(function() {

  angular.module('app.IndexController', [])

  .controller('IndexController', ['common', '$cordovaFile','$cordovaFileTransfer','$timeout', 'core', '$rootScope', '$scope', '$stateParams', '$state', '$q', 'core', '$location', '$ionicContentBanner', 'constants', '$rootScope', '$interval', 'logger', '$sce', '$ionicPopup', 'localStorageManager', IndexController]);
  
  function IndexController(common, $cordovaFile, $cordovaFileTransfer, $timeout, core, $rootScope, $scope, $stateParams, $state, $q, core, $location, $ionicContentBanner, constants, $rootScope, $interval, logger, $sce, $ionicPopup, localStorageManager) {
    var indexController = this,
    enoughTimePassedBetweenMoments = enoughTimePassedBetweenMoments;
    indexController.camera = camera;
    indexController.gallery = gallery;
    indexController.video = video;
    indexController.openDialog = openDialog;
    indexController.contentBanner = undefined;
    
    // $rootScope.$on('$locationChangeStart', function(next, current) {
    //   if(core.aVideoIsUploading) {
    //       $timeout(function() {
    //         if(indexController.contentBanner) {
    //           // indexController.contentBanner();
    //           indexController.contentBanner = null;
    //         }
    //         indexController.contentBanner = $ionicContentBanner.show({
    //           text: ["Uploading, please do not close the app"],
    //           transition: "none"
    //         });
            
    //       }, 500);
    //   }
    //  });

    // $rootScope.$on('upload start', function(event, args) {
    //       $timeout(function() {
    //         if(indexController.contentBanner) {
    //           // indexController.contentBanner();
    //           indexController.contentBanner = null;
    //         }
    //         indexController.contentBanner = $ionicContentBanner.show({
    //           text: ["Uploading, please do not close the app"],
    //           transition: "none"
    //         });
    //       }, 500);
          
    // });

    // $rootScope.$on('upload complete', function(event, args) {
    //        if(indexController.contentBanner) {
    //           indexController.contentBanner();
    //           indexController.contentBanner = null;
    //         }
    //       indexController.contentBanner = $ionicContentBanner.show({
    //         text: ["Upload Complete"],
    //         autoClose: 5000,
    //         transition: "none"
    //       });
    // });

    function openDialog() {
      $ionicPopup.show({ 
        title: "<img src='img/logo.png' height='80px'; width= '80px' ></img>",
        scope: $scope,
        cssClass: 'openDialog',
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
      var permissions = cordova.plugins.permissions;
      permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, function(status) {
        if(!status.checkPermission) {
          permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, success, error);
          function error() {
            console.warn('Camera permission is not turned on');
          }
          function success( status ) {
            if( !status.checkPermission ) error();

              navigator.device.capture.captureVideo(onSuccess, onFail, 
                {
                  limit: 1,
                  duration: constants.MAX_DURATION_OF_VIDEO
                });
              function onSuccess(mediaFiles) {
                var i, path, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    path = mediaFiles[i].fullPath;
                    $state.go('submitMoment', {media: $sce.trustAsResourceUrl(path)});
                }
              };

          }
        }
      });

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
        if(localStorageManager.get('timeSinceLastMoment').length !== 0) {
          var currentTime = new Date().getTime();
          var timeUntilNextMoment = parseInt(localStorageManager.get('timeSinceLastMoment')) + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
          var timeLeft = timeUntilNextMoment - currentTime;
          $scope.momentTimer = common.timeElapsed(currentTime + timeLeft);
          if(currentTime > timeUntilNextMoment) {
            $scope.momentTimer = "0m";
          }
        }
      }
    }, 500);
  };
})();