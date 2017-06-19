(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'geolocation', 'submitMomentService', 'constants', '$ionicContentBanner', '$ionicPopup', 'components', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, geolocation, submitMomentService, constants, $ionicContentBanner, $ionicPopup, components) {
    var vm = this;
    vm.changeLocation = changeLocation;
    vm.cancel = cancel;
    vm.charLimit = charLimit;
    vm.submit = submit;

    var key = '',
    updateMetaData = updateMetaData;
    vm.moment = {
      key: '',
      location: 'Unknown',
      likes: "0",
      time: "",
      description: "",
      views: "0",
      uuids: core.getUUID(),
      creator: core.getUUID()
    };

    vm.picture = $stateParams.picture;
    vm.maxChars = constants.MAX_DESCRIPTION_LENGTH;
    vm.location = true;

    if(!geolocation.userLocation) {
      components.showLoader();
      geolocation.initializeUserLocation().then(function(response) {
        components.hideLoader();
      }, function(error) {
        console.log("ERROR");
        console.log(error.message);
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
      components.showLoader().then(function() {
        if(vm.moment.description.length <= vm.maxChars) {
          updateMomentObject();
          submitMomentService.uploadToAWS(vm.picture, vm.moment).then(function() {
            submitMomentService.uploadToLocalStorage(vm.moment);
            thankUserForSubmission();
            components.hideLoader().then(function() {
              submitMomentService.updateTimeSinceLastMoment();
              localStorage.setItem('timeSinceLastMoment', new Date().getTime().toString());
              $state.go('tabsController.moments');
            });
          }, function(error) {
            components.hideLoader().then(function() {
              console.log("SUBMITION FAILED"); 
              $state.go('tabsController.moments', { 'showErrorBanner': true });
            });
          });

        }
        else {
          components.hideLoader().then(function() {
            console.log("SUBMITION FAILED");  
          });
          $ionicContentBanner.show({
            text: ["Your description is too long."],
            autoClose: 3000
          });
        }
      })

};

function updateMomentObject() {
  if(vm.location) {
    vm.moment.location = geolocation.userLocation.town;
  }
  vm.moment.time = new Date().getTime().toString();
  vm.moment.description = vm.moment.description;
  var key = constants.IMAGE_URL + constants.MOMENT_PREFIX + geolocation.userLocation.town.split(',')[1].trim() + '/' + geolocation.userLocation.lat + '_' + geolocation.userLocation.lng;
  vm.moment.key = key + '_' + new Date().getTime() + '.jpg';
};
};
})();