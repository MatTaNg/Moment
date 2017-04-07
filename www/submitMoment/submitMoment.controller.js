(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'submitMomentService', '$q', 'constants', '$http', '$ionicLoading', '$ionicContentBanner', '$ionicPopup', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, submitMomentService, $q, constants, $http, $ionicLoading, $ionicContentBanner, $ionicPopup) {
    var vm = this,
    key = '',
    updateMetaData = updateMetaData,
    metaData = {location: 'Unknown',
    likes: "0",
    time: "",
    description: "",
    views: "0",
    uuids: core.getUUID()
  };

  vm.picture = $stateParams.picture;
  vm.maxChars = constants.MAX_DESCRIPTION_LENGTH;
  vm.location = true;
  vm.moment = { description: ""};
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
          //Key = prefix/State/Lat, Long.jpg
          var key = constants.MOMENT_PREFIX + core.userLocation.state + '/' + core.userLocation.lat + ',' + core.userLocation.lng;
          key = key + '_' + new Date().getTime() + '.jpg';
          submitMomentService.uploadToLocalStorage(key, metaData);
          submitMomentService.uploadToAWS(key, vm.picture, metaData).then(function() {
            popUp();
            $ionicLoading.hide().then(function() {
              submitMomentService.updateTime();
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
          metaData.location = core.userLocation.town + ", " + core.userLocation.state;
        metaData.time = new Date().getTime().toString();
        metaData.description = vm.moment.description;
      };
    };
  })();