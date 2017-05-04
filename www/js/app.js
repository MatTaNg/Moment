// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ion-gallery', 'ngCordova', 'app.routes', 'core', 'constants', 'myMomentsService', 'app.bestMomentsService', 'app.momentsService', 'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards', 'awsServices', 'logger', 'components', 'geolocation'])

.config(function($ionicConfigProvider, $sceDelegateProvider, ionGalleryConfigProvider, constants){
  ionGalleryConfigProvider.setGalleryConfig({
    row_size: constants.ION_GALLERY_ROW_SIZE
  });
  $ionicConfigProvider.tabs.position('bottom');

  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

})

.run(function($ionicPlatform, $ionicPopup, $state, $rootScope, geolocation, constants, core, myMomentsService, bestMomentsService, momentsService, $q) {
  $ionicPlatform.ready(function() {
    oneSignalSetup();
    initializeApp().then(function() {
      $state.go("tabsController.moments", {}, {reload: true});
    }, function(error) {
    });
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
        $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
      } else {
        initializeApp().then(function() {
        });
      }
    } //window.connection

    function initializeApp() {
      var deferred = $q.defer();
      if(!localStorage.getItem('momentRadiusInMiles')) {
        localStorage.setItem('momentRadiusInMiles', JSON.stringify(constants.DEFAULT_MOMENT_RADIUS_IN_MILES));
      } 
      localStorage.setItem('moments', JSON.stringify([]));
      localStorage.setItem('bestMoments', JSON.stringify([]));
      // localStorage.setItem('myMoments', JSON.stringify([]));

      momentsService.initializeView().then(function(moments) {
        localStorage.setItem('moments', JSON.stringify(moments));
        bestMomentsService.initializeView().then(function(bestmoments) {
          localStorage.setItem('bestMoments', JSON.stringify(bestmoments));
          if(JSON.parse(localStorage.getItem('myMoments')).length > 0) {
            myMomentsService.initialize(JSON.parse(localStorage.getItem('myMoments'))).then(function(moments) {
              localStorage.setItem('myMoments', JSON.stringify(moments));
              deferred.resolve();
            });
          }
          else {
            deferred.resolve();
          }
        }); //End of bestMoments Init
      }, function(error) {
        deferred.reject(error);
      }); //End of moments Init
      return deferred.promise;
    };
    
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