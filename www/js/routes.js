angular.module('app.routes', ['app.momentsCtrl', 'app.momentListCtrl', 'app.cameraCtrl', 'app.textOverlayCtrl', 'tabsController', 'app.myMomentsCtrl', 'app.mainCtrl'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('page', {
    url: '/page1',
    templateUrl: 'templates/page.html',
    controller: 'pageCtrl'
  })

  .state('textOverlay', {
    url: '/textOverlay',
    params: {'picture' : null},
    templateUrl: 'textOverlay/textOverlay.html',
    controller: 'textOverlayCtrl'
  })

      .state('tabsController.moments', {
    url: '/moments',
    views: {
      'tab1': {
        templateUrl: 'moments/moments.html',
        controller: 'momentsCtrl'
      }
    }
  })

  .state('tabsController.bestMoments', {
    url: '/bestMoments',
    views: {
      'tab2': {
        templateUrl: 'momentList/momentList.html',
        controller: 'momentListCtrl'
      }
    }
  })

  .state('tabsController.myMoments', {
    url: '/myMoments',
    views: {
      'tab3': {
        templateUrl: 'myMoments/myMoments.html',
        controller: 'myMomentsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    controller: 'tabsController',
    abstract:true
  })

$urlRouterProvider.otherwise('/page1/moments')
  

});