// describe('MyMoment Controller', function() {

//     var core, $rootScope, constants, $q, momentsService, myMomentsService, $ionicPopup, components, $scope, geolocation;

//     beforeEach(module('app'));
//     beforeEach(module('core'));
//     beforeEach(module('components'));
//     beforeEach(module('constants'));

//     beforeEach(inject(function(_$controller_, _core_, $rootScope, constants, $q, _momentsService_, _myMomentsService_, $ionicPopup, _components_, $scope, _geolocation_) {
//         var self = this;
//         this.$scope = $rootScope.$new();
//         this.myMomentsService = _myMomentsService_;

//         this.$ionicContentBanner = _$ionicContentBanner_;
//         this.constants = _constants_;
//         this.core = _core_;
//         this.momentsService = _momentsService_;
//         this.components = _components_;
//         this.$q = _$q_;
//         this.$ionicPopup = _$ionicPopup_;
//         this.geolocation = _geolocation_;

//         this.$controller = _$controller_('MomentsController', {
//             momentsService: momentsService, 
//             $scope: $scope, 
//             $ionicContentBanner: $ionicContentBanner,
//             core: core,
//             constants: constants,
//             component: components,
//             $q: $q,
//             $ionicPopup: $ionicPopup,
//             geolocation: geolocation
//         });
//     }));

//     it('should initialize', function() { 
//         console.log(this);
//         console.log("CONTROLLER");
//     });

// });