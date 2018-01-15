// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 
  'ngCordova', 
  'app.routes', 
  'core', 
  'constants',
  'myMomentsService',
  'app.bestMomentsService',
  'app.momentsService',
  'awsServices', 
  'logger', 
  'components', 
  'geolocation', 
  'localStorageManager', 
  'multipartUpload', 
  'permissions',
  'downloadManager', 
  'notificationManager', 
  'app.MomentsController', 
  'commentsModule',
  'commonModule', 
  'momentViewDirective',
  'MomentViewController',
  'geolocationService',
  'userNameDirective',
  'UserNameController',
  'UserNotificationsController',
  'userNotificationsDirective',
  'UserLocationController',
  'userLocationDirective',
  'app.IndexController',
  'UserRadiusController',
  'userRadiusDirective'



  // ]) //Uncomment to test
  ,'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards',
  "ngSanitize",
  "com.2fdevs.videogular",
  "com.2fdevs.videogular.plugins.controls",
  "com.2fdevs.videogular.plugins.overlayplay",
  "com.2fdevs.videogular.plugins.poster"])
.config(function($ionicConfigProvider, $sceDelegateProvider, constants){
  $ionicConfigProvider.tabs.position('bottom');
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**', '*://s3.amazonaws.com/mng-moment/**']);
})

.run(function($ionicPlatform, $ionicPopup, $state, $timeout, constants, notificationManager) {
  $ionicPlatform.ready(function() {
    
  $ionicPlatform.registerBackButtonAction(function(event) {
    if (true) { // your check here
      $ionicPopup.confirm({
        title: 'System warning',
        template: 'Are you sure you want to exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      })
    }
  }, 100);

    // document.addEventListener("pause", onPause, false) //Fires when user minimizes app
    oneSignalSetup(); //Comment out for automated testing
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
        // console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
      };
      //https://documentation.onesignal.com/v3.0/docs/cordova-sdk#section--handlenotificationopened-
      window.plugins.OneSignal
      .startInit(constants.ONE_PUSH_APP_ID)
      .handleNotificationOpened(notificationOpenedCallback) //User opens notification
      .handleNotificationReceived(notificationOpenedCallback) //App is in focus
      .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification) //How notifications are displays in App (Notification | InAppAlert | None)
      .endInit();
      window.plugins.OneSignal.getIds(function(ids) {
        console.log("SET PLAY ID");
        console.log(JSON.stringify(ids['userId']));
          //document.getElementById("OneSignalUserID").innerHTML = "UserID: " + ids.userId;
          //document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + ids.pushToken;
          localStorage.setItem("OneSignal_PlayerID", JSON.stringify(ids['userId']));
      });
      // Call syncHashedEmail anywhere in your app if you have the user's email.
      // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
      // window.plugins.OneSignal.syncHashedEmail(userEmail);
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