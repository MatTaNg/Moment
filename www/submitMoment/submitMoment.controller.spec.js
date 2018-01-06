// describe('SubmitMoment Controller', function() {

//     var $stateParams, $state, core, geolocation, submitMomentService, constants, $ionicContentBanner, $ionicPopup, components

//     beforeEach(module('app'));
//     beforeEach(module('core'));
//     beforeEach(module('components'));
//     beforeEach(module('constants'));


//     beforeEach(inject(function(_$controller_, $rootScope, $stateParams, $state, _core_, _geolocation_, _submitMomentService_, _constants_, $ionicContentBanner, $ionicPopup, _components_) {
//         var self = this;
//         this.$scope = $rootScope.$new();
//         this.submitMomentService = _submitMomentService_;
//         this.$stateParams = $stateParams;
//         this.$state = $state;
//         this.geolocation = _geolocation_;
//         this.constants = _constants_;

//         this.$ionicContentBanner = _$ionicContentBanner_;
//         this.core = _core_;
//         this.components = _components_;
//         this.$ionicContentBanner = _$ionicContentBanner_;
//         this.$ionicPopup = _$ionicPopup_;

//         this.$controller = _$controller_('MomentsController', {
//             submitMomentService: submitMomentService, 
//             $scope: $scope, 
//             $stateParams: $stateParams,
//             $state: $state,
//             geolocation: geolocation,
//             constants: constants,
//             $ionicContentBanner: $ionicContentBanner,
//             core: core,
//             component: components,
//             $ionicPopup: $ionicPopup
//         });
//     }));

//     it('should initialize', function() { 
//         console.log(this);
//         console.log("CONTROLLER");
//     });

// });