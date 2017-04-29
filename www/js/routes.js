angular.module('app.routes', ['bestMoments', 'moments', 'myMoments', 'submitMoment', 'app.IndexController', 'mainview'])

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

  .state('submitMoment', {
    url: '/submitMoment',
    params: {'picture' : null},
    templateUrl: 'submitMoment/submitMoment.html',
    controller: 'SubmitMomentController',
    controllerAs: 'vm'
  })

  .state('tabsController.moments', {
    url: '/moments',
    cache: false,
    views: {
      'tab1': {
        templateUrl: 'moments/moments.html',
        controller: 'MomentsController',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController.bestMoments', {
    url: '/bestMoments',
    views: {
      'tab2': {
        templateUrl: 'bestMoments/bestMoments.html',
        controller: 'BestMomentsController',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController.myMoments', {
    url: '/myMoments',
    views: {
      'tab3': {
        templateUrl: 'myMoments/myMoments.html',
        controller: 'MyMomentsController',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'layout/tabsController.html',
    controller: 'IndexController',
    abstract:true
  })

  $urlRouterProvider.otherwise('/page1/moments')

 });