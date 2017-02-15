angular.module('app.textOverlayCtrl', [])

.controller('textOverlayCtrl', ['$scope', '$stateParams', '$state', 'coreSvc', 'textOverlaySvc', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, coreSvc, textOverlaySvc) {
  $scope.picture = $stateParams.picture;
  $scope.maxChars = coreSvc.max_description_length;
  $scope.location = true;
  $scope.moment = { description: ""};
  var metaData = {location: "Unknown",
  likes: "0",
  time: "",
  description: "",
  UUIDs: coreSvc.getUUID()};

  $scope.changeLocation = function() {
    $scope.location = !$scope.location;
  };

  $scope.cancel = function() {
    $state.go("tabsController.moments");
  };

  $scope.charLimit = function() {
    if($scope.description.length > 10)
      return "color: red;"
    else
      return "color: green;"
  };

  $scope.submit = function() {
      if($scope.moment.description.length <= $scope.maxChars) {
        updateMetaData($scope.moment.description);
        textOverlaySvc.uploadToLocalStorage($scope.picture, metaData);
        textOverlaySvc.uploadToAWS($scope.picture, metaData);
        $state.go('tabsController.moments');
      }
      else {
        alert("Your description is too long.");
      }
  };

  var updateMetaData = function() {
    if($scope.location === true) {
      metaData.location = coreSvc.getDeviceLocation();
    }
    metaData.time = new Date().getTime().toString();
    metaData.description = $scope.moment.description;
  };

}])