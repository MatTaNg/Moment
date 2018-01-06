// describe('SubmitMoment Controller', function() {

//     var $stateParams, $scope, components, bestMomentsService;

//     beforeEach(module('app'));
//     beforeEach(module('core'));
//     beforeEach(module('components'));
//     beforeEach(module('constants'));

//     beforeEach(inject(function(_$controller_, $rootScope, $stateParams, $scope, _components_, _bestMomentsService_) {
//         var self = this;
//         this.$scope = $rootScope.$new();
//         this.bestMomentsService = _bestMomentsService_;
//         this.$stateParams = $stateParams;
//         this.components = _components_;

//         this.$controller = _$controller_('MomentsController', {
// 	        $scope: $scope,
// 	        bestMomentsService: bestMomentsService,
// 	        $stateParams: $stateParams,
// 	        components: components
//         });
//     }));

//     it('should initialize', function() { 
//         console.log(this);
//         console.log("CONTROLLER");
//     });

// });