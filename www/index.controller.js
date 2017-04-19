(function() {

  angular.module('app.IndexController', [])

  .controller('IndexController', ['$scope', '$stateParams', '$state', '$q', 'core', '$location', '$ionicContentBanner', 'constants', '$rootScope', IndexController]);
  
  function IndexController($scope, $stateParams, $state, $q, core, $location, $ionicContentBanner, constants, $rootScope) {

    var indexController = this,
    enoughTimePassedBetweenMoments = enoughTimePassedBetweenMoments;
    indexController.camera = camera;
    indexController.gallery = gallery;
    indexController.redirectMyMoments = redirectMyMoments;

    function redirectMyMoments() {
      $state.go("tabsController.myMoments");
    }

    function camera() { 
      if(enoughTimePassedBetweenMoments) {
        navigator.camera.getPicture(onSuccess, onFail, 
          { quality: 100, //Quality of photo 0-100
          destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
          allowEdit: true, //Allows editing of picture
          targetWidth: 300,
          targetHeight: 300
        });

        function onSuccess(imageURI) {
          var picture = "data:image/jpeg;base64," + imageURI;
          $state.go('submitMoment', {picture: picture});
        };

        function onFail(message) {
          console.log("Fail");
          console.log('Failed because: ' + message);
        }
      }
    };

    function gallery() {
      if(enoughTimePassedBetweenMoments) {

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
        }
      }
    };
    function enoughTimePassedBetweenMoments() {
      console.log("ENOUGH TIME PASSED");
      console.log(localStorage.getItem('timeSinceLastMoment'));
      var currentTime = new Date().getTime();
      var milisecondsBetweenMoments = constants.hoursBetweenMoments * 3600000;
      return (currentTime > milisecondsBetweenMoments + localStorage.getItem('timeSinceLastMoment'))
    };
    setInterval(function() {
      $scope.momentTimer = "0m";
      if(localStorage.getItem('timeSinceLastMoment')) {
        var currentTime = new Date().getTime();
        var timeUntilNextMoment = parseInt(localStorage.getItem('timeSinceLastMoment')) + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
        // var timeUntilNextMoment = 1492372819141 + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
        var timeLeft = timeUntilNextMoment - currentTime;
        $scope.momentTimer = core.timeElapsed(currentTime + timeLeft);
        if(currentTime > timeUntilNextMoment) {
          $scope.momentTimer = "0m";
        }
      }
    }, 500);
  };
})();