angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.moments', {
    url: '/moments',
    views: {
      'tab1': {
        templateUrl: 'templates/moments.html',
        controller: 'momentsCtrl'
      }
    }
  })

  .state('tabsController.bestMoments', {
    url: '/bestMoments',
    views: {
      'tab2': {
        templateUrl: 'templates/bestMoments.html',
        controller: 'bestMomentsCtrl'
      }
    }
  })

  .state('tabsController.camera', {
    url: '/camera',
    views: {
      'tab3': {
        templateUrl: 'templates/camera.html',
        controller: 'cameraCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

$urlRouterProvider.otherwise('/page1/moments')

  

});