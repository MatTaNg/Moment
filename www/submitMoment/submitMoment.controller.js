(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'submitMomentService', '$q', 'constants', '$http', '$ionicLoading', '$ionicContentBanner', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, submitMomentService, $q, constants, $http, $ionicLoading, $ionicContentBanner) {
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
    console.log(vm.location);
    vm.location = !vm.location;
    console.log(vm.location);
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

  function submit() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    });
    if(vm.moment.description.length <= vm.maxChars) {
      updateMetaData()
      $ionicLoading.hide();
          //Key = prefix/State/Lat, Long.jpg
          var key = constants.MOMENT_PREFIX + core.userLocation.state + '/' + core.userLocation.lat + ',' + core.userLocation.lng;
          submitMomentService.uploadToLocalStorage(vm.picture, metaData);
          submitMomentService.uploadToAWS(key, vm.picture, metaData);
          alert("Submitted");
          submitMomentService.updateTime();
          $state.go('tabsController.moments');
        }
        else {
          $ionicLoading.hide();
          console.log("SUBMITION FAILED");
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
    //   var deferred = $q.defer();
    //   core.getCurrentLatLong().then(function(response) {
    //     key = response.lat + "," + response.lng;
    //     getDeviceLocation(response.lat, response.lng).then(function(location) {
    //       if(vm.location)
    //         metaData.location = location.trim();
    //       metaData.time = new Date().getTime().toString();
    //       metaData.description = vm.moment.description;
    //       deferred.resolve();
    //     }, function(error) {
    //       console.log("FAILED to get device location");
    //       console.log(error);
    //       deferred.reject(error);
    //     });
    //   }, function(error) {
    //     console.log("FAILED to get location");
    //     console.log(error);
    //     deferred.reject(error);
    //   });

    //   return deferred.promise;
    // };

    // function getDeviceLocation(lat, lng) {
    //   var deferred = $q.defer();
    //   var url = 'https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=' + lat + ',' + lng;

    //   $http.get(url).then(function(response) {
    //     key = constants.MOMENT_PREFIX + response.data.results[6].formatted_address + '/' + key + '.jpeg';
    //     response = response.data.results[2].formatted_address;
    //     response = response.slice(0, response.lastIndexOf(','));
    //     response = response.replace(/[0-9]/g, '');
    //     deferred.resolve(response);
    //   }, function(error) {
    //     deferred.reject(error);
    //   });
    //   return deferred.promise;
    // };


  };
})();