// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'app.routes', 'core', 'constants', 'myMomentsService', 'app.bestMomentsService', 'app.momentsService', 'awsServices', 'logger', 'components', 'geolocation', 'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards'])


.config(function($ionicConfigProvider, $sceDelegateProvider, constants){
  $ionicConfigProvider.tabs.position('bottom');

  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

})

.run(function($ionicPlatform, $ionicPopup, $state, $ionicContentBanner) {
  $ionicPlatform.ready(function() {
    oneSignalSetup();
    // initializeApp().then(function() {
      if(navigator.splashscreen)
        navigator.splashscreen.hide();
      $state.go("tabsController.moments", {}, {reload: true});
    // }, function(error) {
    // });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  cordova.plugins.Keyboard.disableScroll(true);
}
if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicContentBanner.show({
          text: ["No connection found"],
          type: "error",
          autoClose: 3000
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
      }
    } //window.connection

    function oneSignalSetup() {
          // Enable to debug issues.
  // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
  
  var notificationOpenedCallback = function(jsonData) {
  };

//   window.plugins.OneSignal
//   .startInit(constants.ONE_PUSH_APP_ID)
//   .handleNotificationOpened(notificationOpenedCallback)
//   .endInit();

//   // Call syncHashedEmail anywhere in your app if you have the user's email.
//   // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
//   // window.plugins.OneSignal.syncHashedEmail(userEmail);
};

});
})

/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
  */
  .directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
      restrict: "A",  
      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

        function stopDrag(){
          $ionicSideMenuDelegate.canDragContent(false);
        }

        function allowDrag(){
          $ionicSideMenuDelegate.canDragContent(true);
        }

        $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
        $element.on('touchstart', stopDrag);
        $element.on('touchend', allowDrag);
        $element.on('mousedown', stopDrag);
        $element.on('mouseup', allowDrag);

      }]
    };
  }])

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
  */
  .directive('hrefInappbrowser', function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      link: function(scope, element, attrs) {
        var href = attrs['hrefInappbrowser'];

        attrs.$observe('hrefInappbrowser', function(val){
          href = val;
        });

        element.bind('click', function (event) {

          window.open(href, '_system', 'location=yes');

          event.preventDefault();
          event.stopPropagation();

        });
      }
    };
  });