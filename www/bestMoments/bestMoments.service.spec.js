describe('Best Moment Service', function() {
	var commentManager, localStorageManager, service, geolocation, core_Mock, $q, constants, $scope, $templateCache, commentManager;

	beforeEach(module('app'));

    var mock_comment = {
        key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
        id: "user" + new Date().getTime(),
        likes: "0",
        time: JSON.stringify(new Date().getTime()),
        uuid: 'a3052d4fa4ec79a5',
        onesignalid: "test",
        userName: "MockUser",
        comment: "MockComment",
        commentids: "",
        parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
        replies: []
    };

    var mock_moment = {
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

	beforeEach(inject(function($templateCache) {
    	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
    	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
    	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
    	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
    	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
    	$templateCache.put('templates/page.html', 'layout/tabsController.html');
	}));

    beforeEach(inject(function($injector) {
        $q = $injector.get('$q');
        geolocation = $injector.get('geolocation');
        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
        	return $q.resolve("Narberth, PA");
        });
        core_Mock = $injector.get('core');
        commentManager = $injector.get('commentManager');
        constants = $injector.get('constants');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('bestMomentsService');
        commentManager = $injector.get('commentManager');
        localStorageManager = $injector.get('localStorageManager');
    }));

    beforeEach(function() {
    	spyOn(localStorageManager, 'set').and.callFake(function() {
    		return $q.resolve();
    	});
    });

    function mockOutMoments() {
		return [mock_moment, mock_moment, mock_moment, mock_moment, mock_moment];
    };

	it('Should initialize moments', function(done) {
		service.momentArray = mockOutMoments();
		spyOn(core_Mock, 'getMomentMetaData').and.callFake(function() {
			return $q.resolve(mockOutMoments());
		});
		spyOn(core_Mock, 'listMoments').and.callFake(function(key, startAfter) {
			expect(key).toEqual(constants.BEST_MOMENT_PREFIX);
			expect(startAfter).toEqual('');
			return $q.resolve(mockOutMoments());
		});	
		spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function(moments) {
			expect(moments).toEqual(mockOutMoments());
			return $q.resolve(mockOutMoments());
		});
		service.initializeView().then(function(moments) {
			expect(localStorageManager.set).toHaveBeenCalledWith('bestMoments', mockOutMoments());
			expect(service.momentArray.length).toEqual(mockOutMoments().length);
			expect(moments).toEqual(mockOutMoments());
			done();
		});
		$scope.$apply();
	});

it('Should load more', function(done) {
	service.momentArray = mockOutMoments();
	spyOn(core_Mock, 'listMoments').and.callFake(function(prefix, startAfter) {
		expect(prefix).toEqual(constants.BEST_MOMENT_PREFIX);
		expect(startAfter).toEqual('bestMoments/40.0014951_-75.2700205_1515996539543.jpg');
		return $q.resolve(mockOutMoments());
	});
	service.loadMore().then(function(moments) {
		expect(moments).toEqual(mockOutMoments());
		done();
	});
	$scope.$apply();
});

});