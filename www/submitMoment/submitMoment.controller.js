(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'geolocation', 'submitMomentService', 'constants', '$ionicContentBanner', '$ionicPopup', 'components', '$sce', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, geolocation, submitMomentService, constants, $ionicContentBanner, $ionicPopup, components, $sce) {
    var vm = this;
    vm.changeLocation = changeLocation;
    vm.cancel = cancel;
    vm.charLimit = charLimit;
    vm.submit = submit;
    vm.isPicture = false;
    vm.isVideo = false;

    var key = '',
    updateMetaData = updateMetaData;

    vm.maxChars = constants.MAX_DESCRIPTION_LENGTH;
    vm.location = true;
    vm.moment = {
        key: '',
        location: 'Unknown',
        likes: "0",
        time: "",
        description: "",
        views: "0",
        uuids: core.getUUID(),
        creator: core.getUUID(),
        media: ""
    };

    vm.media = $stateParams.media;
    if(typeof(vm.media) === "string") {
      vm.isPicture = true;
    }
    if(typeof(vm.media) === "object") {
      vm.media = $sce.valueOf(vm.media);
      vm.isVideo = true;
    }

    if(!geolocation.userLocation) {
      components.showLoader();
      geolocation.initializeUserLocation().then(function(response) {
        components.hideLoader();
      }, function(error) {
        console.log("ERROR");
        console.log(error.message);
        components.hideLoader();
      })
    }

    function changeLocation() {
      vm.location = !vm.location;
    };

    function cancel() {
      $state.go("tabsController.moments");
    };

    function charLimit() {
      if(vm.description.length > 10)
        return "color: red;"
      else
        return "color: green;"
    };

    function thankUserForSubmission() {
      $ionicPopup.alert({
        title: '<b>Thank you for your Submission!</b>',
        template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
      });
    };

    function submit() {
        if(vm.moment.description.length <= vm.maxChars) {
          $ionicContentBanner.show({
            text:["Uploading, please do not close the app"],
            cancelOnStateChange: false
          });
          updateMomentObject();
          submitMomentService.uploadToAWS(vm.media, vm.moment);
            submitMomentService.uploadToLocalStorage(vm.moment);
            // thankUserForSubmission();
            submitMomentService.updateTimeSinceLastMoment();
            localStorage.setItem('timeSinceLastMoment', new Date().getTime().toString());
            $state.go('tabsController.moments');
          }
        else {
          $ionicContentBanner.show({
            text: ["Your description is too long."],
            autoClose: 3000
          });
        }
};

function updateMomentObject() {
  if(vm.location) {
    vm.moment.location = core.currentLocation.town;
  }
  vm.moment.time = new Date().getTime().toString();
  vm.moment.description = vm.moment.description;
  var key = constants.IMAGE_URL + constants.MOMENT_PREFIX + core.currentLocation.town.split(',')[1].trim() + '/' + core.currentLocation.lat + '_' + core.currentLocation.lng;
  if(vm.isPicture) {
    vm.moment.key = key + '_' + new Date().getTime() + '.jpg';
    vm.moment.media = "picture";
  }
  else {
   vm.moment.key = key + '_' + new Date().getTime() + '.mp4'; 
   vm.moment.media = "video";
  }
};
};
})();