describe('Best Moments Controller', function() {

    var $q, controller, $scope, $rootScope, createController, core, components, bestMomentsService, localStorageManager, constants,
    mockMoments = mockOutMoments();

    beforeEach(module('app'));

	beforeEach(inject(function($templateCache) {
    	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
    	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
    	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
    	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
    	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
    	$templateCache.put('templates/page.html', 'layout/tabsController.html');
    	$templateCache.put('common/momentView/momentView.html', 'layout/tabsController.html');
	}));

    function mockOutMoments() {
		return {
			key: "moment/PA/40.0014951_-75.2700205_1515996539543.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime().toString(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'MOCK_COMMENT_IDS',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
		};
	};

	beforeEach(inject(function($controller, $rootScope, _constants_, _localStorageManager_, _bestMomentsService_, _core_, _$q_) {
		$scope = $rootScope.$new();
		$q = _$q_;
		constants = _constants_;
		localStorageManager = _localStorageManager_;
		bestMomentsService = _bestMomentsService_;
		core = _core_;

		spyOn(localStorageManager, 'get').and.returnValue([mockOutMoments]);

		createController = function() {
			return $controller('BestMomentsController', {
				'$scope': $scope
			})
		};
	}));

	beforeEach(function() {
		spyOn(core, 'remove');
	});

    it('should initialize', function() { 
    	controller = createController();
		spyOn(bestMomentsService, 'initializeView').and.callFake(function() {
			return $q.resolve([mockOutMoments()]);
		});

    	var expectedMoments = [mockOutMoments()];
    	expectedMoments[0].showComments = false;

    	controller.initialize();
    	$scope.$apply();

    	expect(controller.showCommentSpinner).toEqual(false);
    	expect(controller.stopLoadingData).toEqual(false);
    	expect(controller.loadingMoments).toEqual(false);
    	expect(controller.moments[0].rank).toBeGreaterThan(0.9);
    	delete controller.moments[0].rank;

    	controller.moments[0].time = controller.moments[0].time.substring(0, controller.moments[0].time.substring.length - 2);
    	expectedMoments[0].time = expectedMoments[0].time.substring(0, expectedMoments[0].time.substring.length - 2);
    	expect(controller.moments).toEqual(expectedMoments);
    });

    it('should initialize and remove old best moments', function() { 
    	controller = createController();
		spyOn(bestMomentsService, 'initializeView').and.callFake(function() {
			var temp = [mockOutMoments()];
			temp[0].time = '15';
			return $q.resolve(temp);
		});

    	var expectedMoments = [mockOutMoments()];
    	expectedMoments[0].showComments = false;
    	controller.initialize();
    	$scope.$apply();

    	expect(controller.showCommentSpinner).toEqual(false);
    	expect(controller.stopLoadingData).toEqual(false);
    	expect(controller.loadingMoments).toEqual(false);
    	expect(controller.moments[0].rank).toBeLessThan(0);
    	delete controller.moments[0].rank;

    	controller.moments[0].time = controller.moments[0].time.substring(0, controller.moments[0].time.substring.length - 2);
    	expectedMoments[0].time = expectedMoments[0].time.substring(0, expectedMoments[0].time.substring.length - 2);
    	expect(controller.moments).toEqual(expectedMoments);
    	expect(core.remove).toHaveBeenCalledWith(controller.moments[0]);
    });

	it('should load more moments', function() {
		controller = createController();
		spyOn(bestMomentsService, 'loadMore').and.callFake(function() {
			return $q.resolve([mockOutMoments()]);
		});
		spyOn($scope, '$broadcast');
		expect(controller.moments.length).toEqual(1);
		controller.loadMore();
		$scope.$apply();

		expect(controller.moments.length).toEqual(2);
		expect($scope.$broadcast).toHaveBeenCalledWith('scroll.infiniteScrollComplete');
	});

	it('should stop loading more moments if none are returned', function() {
		controller = createController();
		spyOn(bestMomentsService, 'loadMore').and.callFake(function() {
			return $q.resolve([]);
		});
		spyOn($scope, '$broadcast');
		expect(controller.moments.length).toEqual(1);
		controller.loadMore();
		$scope.$apply();

		expect(controller.stopLoadingData).toEqual(true);
		expect(controller.moments.length).toEqual(1);
		expect($scope.$broadcast).toHaveBeenCalledWith('scroll.infiniteScrollComplete');
	});
});