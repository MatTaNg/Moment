// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'app.routes', 'core', 'constants', 'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards', 'awsServices'])

.config(function($ionicConfigProvider, $sceDelegateProvider){
  $ionicConfigProvider.tabs.position('bottom');

  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

})

.run(function($ionicPlatform, $ionicPopup, $rootScope, constants, core) {
  // setTimeSinceLastMoment;
  $ionicPlatform.ready(function() {
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
      }
    } //window.connection
  });
  // var setTimeSinceLastMoment = setInterval(function() {
  //   console.log("TIME SINCE LAST MOMENT");
  //   $rootScope.momentTimer = "0m";
  //   if(localStorage.getItem('timeSinceLastMoment')) {
  //     var currentTime = new Date().getTime();
  //     var timeUntilNextMoment = localStorage.getItem('timeSinceLastMoment') + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
  //     // var timeUntilNextMoment = 1491591825758 + constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_BETWEEN_MOMENTS;
  //     var timeLeft = timeUntilNextMoment - currentTime;
  //     $rootScope.momentTimer = core.timeElapsed(currentTime + timeLeft);
  //     if(currentTime > timeUntilNextMoment) {
  //       $rootScope.momentTimer = 0;
  //     }
  //   }
  // }, 1000);

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