describe('Moment Controller', function() {

    var $scope, $controller, momentsService, $ionicContentBanner, core, components, $q, $ionicPopup;

    beforeEach(module('app'));
    beforeEach(module('core'));
    beforeEach(module('components'));
    beforeEach(module('constants'));

    beforeEach(inject(function($injector) {
        momentsService = $injector.get('momentsService');
        core = $injector.get('core');
        $q = $injector.get('$q');
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        geolocation = $injector.get('geolocation');
    }));
    // beforeEach(inject(function(_$controller_, $rootScope, _momentsService_, _$ionicContentBanner_, _core_, _components_, _$q_, _$ionicPopup_) {
    //     console.log("INJECTING...");
    //     $scope = $rootScope.$new();
    //     momentsService = _momentsService_;

    //     $ionicContentBanner = _$ionicContentBanner_;
    //     core = _core_;
    //     components = _components_;
    //     $q = _$q_;
    //     $ionicPopup = _$ionicPopup_;

    //     spyOn(momentsService, 'initializeView');

    //     $controller = _$controller_('MomentsController', {
    //         momentsService: momentsService, 
    //         $scope: $scope, 
    //         $ionicContentBanner: $ionicContentBanner,
    //         core: core,
    //         component: components,
    //         $q: $q,
    //         $ionicPopup: $ionicPopup
    //     });
    // }));

    it('should initialize', function() { 
        // beforeEach();
        console.log("CONTROLLER");
        console.log(momentsService);
        
    });

});