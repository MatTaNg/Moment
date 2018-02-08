describe('Moment Service', function() {
	var common, $rootScope, service, core, $q, constants, logger, geolocation, $scope, $templateCache, localStorageManager, commentManager,
	momentArray_Mock = [1, 2, 3, 4, 5];

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
		return [
		{
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
		},
		{
			key: "moment/PA/40.0014951_-75.2700205_1515996539542.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'MOCK_COMMENT_IDS',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
		},
		{
			key: "moment/PA/40.0014951_-75.2700205_1515996539541.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'MOCK_COMMENT_IDS',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
		},
		{
			key: "moment/PA/40.0014951_-75.2700205_1515996539540.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'MOCK_COMMENT_IDS',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
		},
		{
			key: "moment/PA/40.0014951_-75.2700205_1515996539539.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'MOCK_COMMENT_IDS',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
		},
		];
    };

    beforeEach(inject(function($injector) {
    	
        $q = $injector.get('$q');
        geolocation = $injector.get('geolocation');
        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
        	return $q.resolve("Narberth, PA");
        });
        core = $injector.get('core');
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('momentsService');
        $rootScope = $injector.get('$rootScope');
        commentManager = $injector.get('commentManager');
        localStorageManager = $injector.get('localStorageManager');
        common = $injector.get('common');
    }));

    beforeEach(function() {
		spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
			return $q.resolve(mockOutMoments());
		});
		spyOn(common, 'uploadToBestMoments');
		spyOn(common, 'removeFromBestMoments');
    });

it('Should initializeView and show new user tutorial', function(done) {
	spyOn(geolocation, 'getMomentsAroundUser');
	var mockedMoments = mockOutMoments();
	mockedMoments.splice(4, 1);
	mockedMoments.splice(3, 1);
	var tutorialKey = constants.MOMENT_PREFIX + 'tutorial';
	spyOn(core, 'listMoments').and.callFake(function(key) {
		expect(key).toEqual(tutorialKey);
		return $q.resolve(mockedMoments);
	});
	service.initializeView().then(function(moments) {
		expect(moments).toEqual(mockedMoments);
		expect(geolocation.getMomentsAroundUser).not.toHaveBeenCalled();
		done();
	});
	$rootScope.$apply();
});

//---Does not work without this.getNearbyMoments added to moments.service
it('Should call initializeView and remove moments with users uuid HappyPath', function(done) {
	var mockedMoments = mockOutMoments();
	spyOn(geolocation, 'getMomentsAroundUser').and.callFake(function() {
		return $q.resolve(mockOutMoments());
	});
	spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function() {
		return $q.resolve(mockedMoments);
	});
	spyOn(core, 'listMoments').and.callFake(function() {
		return $q.resolve([]);
	});

	mockedMoments[0].uuids = common.getUUID();
	core.didUserChangeRadius = true;
	service.initializeView().then(function(moments) {
		mockedMoments.splice(0, 1);
		expect(moments).toEqual(mockedMoments);
		expect(service.getStartAfterKey()).toEqual("moment/PA/40.0014951_-75.2700205_1515996539539.jpg");
		expect(geolocation.getDidUserChangeRadius()).toEqual(false);

		expect(localStorageManager.addandDownload).toHaveBeenCalledWith('moments', mockedMoments);
		expect(common.uploadToBestMoments).not.toHaveBeenCalled();
		expect(common.removeFromBestMoments).not.toHaveBeenCalled();
		done();
	});
	// $scope.$apply();
	$rootScope.$apply();
});

//Doesn't work
it('Should upload to best moments', function(done) {
	var mocked_moments = mockOutMoments();
	mocked_moments[0].likes = 200;
	mocked_moments[0].views = 20;
	spyOn(geolocation, 'getMomentsAroundUser').and.callFake(function() {
		return $q.resolve(mocked_moments);
	});
	spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function() {
		return $q.resolve(mocked_moments);
	});
	spyOn(core, 'listMoments').and.callFake(function() {
		return $q.resolve([]);
	});
	service.initializeView().then(function(moments) {
		expect(common.uploadToBestMoments).toHaveBeenCalledWith(mocked_moments[0]);
		expect(common.removeFromBestMoments).not.toHaveBeenCalled();
		done();
	});
	$rootScope.$apply();
});	

it('Should remove from best moments', function(done) {
	var mocked_moments = mockOutMoments();
	mocked_moments[0].likes = 50;
	mocked_moments[0].views = 100;
	spyOn(geolocation, 'getMomentsAroundUser').and.callFake(function() {
		return $q.resolve(mocked_moments);
	});
	spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function() {
		return $q.resolve(mocked_moments);
	});
	spyOn(core, 'listMoments').and.callFake(function() {
		return $q.resolve([]);
	});

	service.initializeView().then(function(moments) {
		expect(common.uploadToBestMoments).not.toHaveBeenCalled();
		expect(common.removeFromBestMoments).toHaveBeenCalledWith(mocked_moments[0]);
		done();
	});
	$rootScope.$apply();
});

it('Should remove expired moments', function(done) {
	var mocked_moments = mockOutMoments();
	mocked_moments[0].time = new Date().getTime() - 31556952000; //+1 year
	spyOn(geolocation, 'getMomentsAroundUser').and.callFake(function() {
		return $q.resolve(mocked_moments);
	});
	spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function(moments) {
		expect(moments.length).toEqual(4);
		return $q.resolve(mocked_moments);
	});
	spyOn(core, 'listMoments').and.callFake(function() {
		return $q.resolve([]);
	});
	spyOn(core, 'remove').and.callFake(function (moment) {
		expect(moment).toEqual(mocked_moments[0]);
	});
	spyOn(localStorageManager, 'remove').and.callFake(function (storage, moment) {
		expect(storage).toEqual('moments');
		expect(moment).toEqual(mocked_moments[0]);
	});

	service.initializeView().then(function(moments) {
		done();
	});
	$rootScope.$apply();
});

it('Should update moment on like', function(done) {
	service.momentArray = mockOutMoments();
	var expectedMoment = mockOutMoments()[0];
	expectedMoment.views = JSON.stringify(expectedMoment.views + 1);
	expectedMoment.likes = JSON.stringify(expectedMoment.likes + 1);
	expectedMoment.uuids = expectedMoment.uuids + ' ' + common.getUUID();
	delete expectedMoment.comments;

	spyOn(core, 'edit').and.callFake(function(moment) {
		moment.time = "MOCK TIME";
		expectedMoment.time = "MOCK TIME";
		expect(moment).toEqual(expectedMoment);
		return $q.resolve();
	});
	spyOn(localStorageManager, 'set');
	service.updateMoment(true).then(function() {
		expect(localStorageManager.set).toHaveBeenCalled();
		done();
	});
	$rootScope.$apply();
});

it('Should NOT update moment on DISlike', function(done) {
		service.momentArray = mockOutMoments();
	var expectedMoment = mockOutMoments()[0];
	expectedMoment.views = JSON.stringify(expectedMoment.views + 1);
	expectedMoment.uuids = expectedMoment.uuids + ' ' + common.getUUID();
	delete expectedMoment.comments;

	spyOn(core, 'edit').and.callFake(function(moment) {
		delete moment.time;
		delete expectedMoment.time;
		expect(moment).toEqual(expectedMoment);
		return $q.resolve();
	});
	spyOn(localStorageManager, 'set');
	service.updateMoment(false).then(function() {
		expect(localStorageManager.set).toHaveBeenCalled();
		done();
	});
	$rootScope.$apply();
});

it('Should upload a report', function(done) {
	var mockText = "TEST";
	spyOn(logger, 'logReport').and.callFake(function(report, moment, file) {
		expect(report).toBe(mockText);
		moment.time = mockOutMoments()[0].time;
		expect(moment).toEqual(mockOutMoments()[0]);
		expect(file).toBe('flagged.txt');
		done();
		return $q.resolve();
	});
	service.uploadReport(mockText, mockOutMoments()[0]);
});

it('Should add extra classes and set time', function() {
	spyOn(common, 'timeElapsed');
	var result = service.addExtraClassesandSetTime(mockOutMoments());

	expect(result[0].class).toEqual("layer-top");
	expect(result[0].showComments).toEqual("true");
	expect(result[0].animate).toEqual("invisible");

	expect(result[1].class).toEqual("layer-next");
	expect(result[1].animate).toEqual("invisible");

	expect(result[2].class).toEqual("layer-hide");
	expect(result[2].animate).toEqual("invisible");

	expect(common.timeElapsed).toHaveBeenCalled();

	$rootScope.$apply();
});

});