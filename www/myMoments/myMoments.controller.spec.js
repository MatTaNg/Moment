// describe('Best Moments Controller', function() {

//     var common, $ionicLoading, $sce, core, $rootScope, constants, $q, myMomentsService, $ionicPopup, components, $scope, geolocation, $ionicContentBanner, localStorageManager,
//     mockMoments = mockOutMoments();

//     beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
//     	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
//     	$templateCache.put('templates/page.html', 'layout/tabsController.html');
//     	$templateCache.put('common/momentView/momentView.html', 'layout/tabsController.html');
// 	}));

//     function mockOutMoments() {
// 		return {
// 			key: "moment/PA/40.0014951_-75.2700205_1515996539543.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: new Date().getTime().toString(),
// 			uuids: "123",
// 			views: 1,
// 			media: 'picture',
// 			onesignalid: 'MOCK_SIGNAL_ID',
// 			bestmoment: false,
// 			commentids: 'MOCK_COMMENT_IDS',
// 			comments: 'MOCK_COMMENTS',
// 			creator: 'MOCK_CREATOR'
// 		};
// 	};

// 	beforeEach(inject(function($controller, $rootScope, _$q_, _common_, _$ionicLoading_, _$sce_, _constants_, _myMomentsService_, _$ionicPopup_, _geolocation_, _$ionicContentBanner_, _localStorageManager_) {
// 		$scope = $rootScope.$new();
// 		$q = _$q_;
// 		common = _common_;
// 		$ionicLoading = _$ionicLoading_;
// 		$sce = _$sce_;
// 		constants = _constants_;
// 		myMomentsService = _myMomentsService_;
// 		$ionicPopup = _$ionicPopup_;
// 		geolocation = _geolocation_;
// 		$ionicContentBanner = _$ionicContentBanner_;
// 		localStorageManager = _localStorageManager_;
// 		core = _core_;

// 		spyOn(localStorageManager, 'get').and.returnValue([mockOutMoments]);

// 		createController = function() {
// 			return $controller('BestMomentsController', {
// 				'$scope': $scope
// 			})
// 		};
// 	}));

// 	beforeEach(function() {
// 		spyOn(core, 'remove');
// 	});

// 	it('Should initialize', function() {

// 	});

// });