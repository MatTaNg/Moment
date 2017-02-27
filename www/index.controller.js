(function() {

  angular.module('app.IndexController', [])

  .controller('IndexController', ['$scope', '$stateParams', '$state', '$q', 'core', '$location', IndexController]);
  
  function IndexController($scope, $stateParams, $state, $q, core, $location) {
    var indexController = this,
        enoughTimePassedBetweenMoments = enoughTimePassedBetweenMoments;

    indexController.camera = camera;
    indexController.gallery = gallery;
    indexController.redirectMyMoments = redirectMyMoments;

    function redirectMyMoments() {
      console.log("REDIRECT");
      // $location.path("#/page1/myMoments");
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
          $state.go('tabsController.submitMoment', {picture: picture});
        }

        function onFail(message) {
          console.log("Failed because: " + message);
        }
      }
    };
    function enoughTimePassedBetweenMoments() {
      var currentTime = new Date().getTime();
      var milisecondsBetweenMoments = core.hoursBetweenMoments * 3600000;
      return (currentTime > milisecondsBetweenMoments + localStorage.getItem('timeSinceLastMoment'))
    };
  };
})();