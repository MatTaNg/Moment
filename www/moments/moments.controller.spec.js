describe('Moment Controller', function() {

    var $scope, $controller, momentsService, $ionicContentBanner, core, components, $q, $ionicPopup, $window;

    // beforeEach(module('jett.ionic.content.banner'), []);
    beforeEach(module('app'), ['ionic', 'ngCordova', 'app.routes', 'core', 'constants', 'myMomentsService', 'app.bestMomentsService', 'app.momentsService', 'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards', 'awsServices', 'logger', 'components', 'geolocation']);
    // beforeEach(module('core'));
    // beforeEach(module('components'));
    // beforeEach(module('constants'));


    beforeEach(inject(function(_$controller_, $rootScope, momentsService, $ionicContentBanner, core, components, $q, $ionicPopup, $window) {
        // var self = this;
        // this.$scope = $rootScope.$new();
        // this.momentsService = _momentsService_;

        // this.$ionicContentBanner = _$ionicContentBanner_;
        // this.core = _core_;
        // this.components = _components_;
        // this.$q = _$q_;
        // this.$ionicPopup = _$ionicPopup_;

        // spyOn(momentsService, 'initializeView');

        // this.$controller = _$controller_('MomentsController', {
        //     momentsService: momentsService, 
        //     $scope: $scope, 
        //     $ionicContentBanner: $ionicContentBanner,
        //     core: core,
        //     component: components,
        //     $q: $q,
        //     $ionicPopup: $ionicPopup
        // });
    }));

    it('should initialize', function() { 
        // console.log(this);
        // console.log("CONTROLLER");
        // console.log(this.momentsService);
        // console.log(this.momentsService.initializeView());
    });

});