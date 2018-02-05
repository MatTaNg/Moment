// describe('Best Moments Controller', function() {

//     var $q, controller, $scope, $rootScope, createController, notificationManager, $scope, $ionicPopup, commentManager, localStorageManager,
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

// 	beforeEach(inject(function($controller, $rootScope, _$q_, _notificationManager_, _$ionicPopup_, _commentManager_, _localStorageManager_) {
// 		$scope = $rootScope.$new();
// 		$q = _$q_;
// 		notificationManager = _notificationManager_;
// 		$ionicPopup = _$ionicPopup_;
// 		commentManager = _commentManager_;
// 		localStorageManager = _localStorageManager_;

// 		spyOn(localStorageManager, 'get').and.returnValue([mockOutMoments]);

// 		createController = function() {
// 			return $controller('UserNotificationsController', {
// 				'$scope': $scope
// 			})
// 		};
// 	}));

// 	it('Should edit notifications', function() {
// 		spyOn($ionicPopup, 'show').and.callFake(function() {
// 			return $q.resolve(true);
// 		})
// 		spyOn(localStorageManager, 'set');

// 		controller = createController();
// 		controller.editNotifications();
// 		$scope.$apply();

// 		expect(localStorageManager.set).toHaveBeenCalled();
// 		// expect(localStorageManager.set).toHaveBeenCalledWith('notificationStatus');
// 	});
// });