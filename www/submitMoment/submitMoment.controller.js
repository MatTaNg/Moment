(function() {

  angular.module('app.SubmitMomentController', [])

  .controller('SubmitMomentController', ['$stateParams', '$state', 'core', 'submitMomentService', SubmitMomentController]);
  function SubmitMomentController($stateParams, $state, core, submitMomentService) {
    var vm = this,
    updateMetaData = updateMetaData,
    metaData = {location: "Unknown",
              likes: "0",
              time: "",
              description: "",
              views: "0",
              UUIDs: core.getUUID()};

    vm.picture = $stateParams.picture;
    vm.maxChars = core.max_description_length;
    vm.location = true;
    vm.moment = { description: ""};
    vm.changeLocation = changeLocation;
    vm.cancel = cancel;
    vm.charLimit = charLimit;
    vm.submit = submit;

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

    function submit() {
      if(vm.moment.description.length <= vm.maxChars) {
        updateMetaData(vm.moment.description);
        submitMomentService.updateTime();
        submitMomentService.uploadToLocalStorage(vm.picture, metaData);
        submitMomentService.uploadToAWS(vm.picture, metaData);
        $state.go('tabsController.moments');
      }
      else {
        alert("Your description is too long.");
      }
    };

    function updateMetaData() {
      if(vm.location === true) {
        metaData.location = core.getDeviceLocation();
      }
      metaData.time = new Date().getTime().toString();
      metaData.description = vm.moment.description;
    };

  };
})();