describe("Submit moment service", function() {
	var localStorageManager, service, $q, core_Mock, constants, logger, $scope, $templateCache, commentManager;

	beforeEach(module('app'));

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
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('submitMomentService');
        localStorageManager = $injector.get('localStorageManager');
        commentManager = $injector.get('commentManager');
    }));

    beforeEach(function() {
    	spyOn(localStorage, 'setItem')
    	spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(["MOCK"]));
    });

    it('Should upload a picture to AWS', function(done) {
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
    	spyOn(core_Mock, 'upload').and.callFake(function() {
    		return $q.resolve();
    	});
    	spyOn(service, 'dataURItoBlob').and.callFake(function() {
    		return new Blob(["Mock"]);
    	});
    	spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
    		return $q.resolve(mock_moment);
    	});
		service.uploadToAWS(".jpg", mock_moment).then(function(moment) {
			expect(localStorageManager.addandDownload).toHaveBeenCalledWith('myMoments', mock_moment);
			done();
		});
		$scope.$apply();
    });

  //       it('Should upload a video to AWS', function(done) {
  //   	var mock_moment = {
		// 	key: "moment/PA/40.0014951_-75.2700205_1515996539543.mp4",
		// 	description: "MOCK_DESCRIPTION1",
		// 	likes: 1,
		// 	location: "MOCK_LOCATION1",
		// 	time: new Date().getTime().toString(),
		// 	uuids: "123",
		// 	views: 1,
		// 	media: 'picture',
		// 	onesignalid: 'MOCK_SIGNAL_ID',
		// 	bestmoment: false,
		// 	commentids: 'MOCK_COMMENT_IDS',
		// 	comments: 'MOCK_COMMENTS',
		// 	creator: 'MOCK_CREATOR'
		// };
  //   	spyOn(core_Mock, 'upload').and.callFake(function() {
  //   		return $q.resolve();
  //   	});
  //   	spyOn(service, 'dataURItoBlob').and.callFake(function() {
  //   		return new Blob(["Mock"]);
  //   	});
  //   	spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
  //   		return $q.resolve(mock_moment);
  //   	});
		// service.uploadToAWS(".mp4", mock_moment).then(function(moment) {
		// 	expect(localStorageManager.addandDownload).toHaveBeenCalledWith('myMoments', mock_moment);
		// 	done();
		// });
		// $scope.$apply();
  //   });

});