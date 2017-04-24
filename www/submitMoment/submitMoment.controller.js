(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'submitMomentService', 'constants', '$http', '$ionicLoading', '$ionicContentBanner', '$ionicPopup', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, submitMomentService, constants, $http, $ionicLoading, $ionicContentBanner, $ionicPopup) {
    var vm = this,
    key = '',
    updateMetaData = updateMetaData;
    vm.moment = {
      key: '',
      location: 'Unknown',
      likes: "0",
      time: "",
      description: "",
      views: "0",
      uuids: core.getUUID()
    };

    vm.picture = $stateParams.picture;
    vm.maxChars = constants.MAX_DESCRIPTION_LENGTH;
    vm.location = true;
    vm.changeLocation = changeLocation;
    vm.cancel = cancel;
    vm.charLimit = charLimit;
    vm.submit = submit;

    if(!core.userLocation) {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
      core.initializeUserLocation().then(function(response) {
        $ionicLoading.hide();
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

    function popUp() {
      $ionicPopup.alert({
        title: '<b>Thank you for your Submission!</b>',
        template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
      });
    };

    function submit() {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
      if(vm.moment.description.length <= vm.maxChars) {
        updateMetaData();
          var key = constants.MOMENT_PREFIX + core.userLocation.state + '/' + core.userLocation.lat + '_' + core.userLocation.lng;
          vm.moment.key = key + '_' + new Date().getTime() + '.jpg';
          submitMomentService.uploadToLocalStorage(vm.moment);
          submitMomentService.uploadToAWS(vm.picture, vm.moment).then(function() {
            popUp();
            $ionicLoading.hide().then(function() {
              submitMomentService.updateTime();
              localStorage.setItem('timeSinceLastMoment', new Date().getTime().toString());
              $state.go('tabsController.moments');
            });
          }, function(error) {
            $ionicLoading.hide().then(function() {
              console.log("SUBMITION FAILED"); 
            });
          });

        }
        else {
          $ionicLoading.hide().then(function() {
            console.log("SUBMITION FAILED");  
          });
          $ionicContentBanner.show({
            text: ["Your description is too long."],
            autoClose: 3000
          });
        }
      };

      function updateMetaData() {
        if(vm.location)
          vm.moment.location = core.userLocation.town + ", " + core.userLocation.state;
        vm.moment.time = new Date().getTime().toString();
        vm.moment.description = vm.moment.description;
      };
    };
  })();