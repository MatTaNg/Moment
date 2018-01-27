describe('Core', function() {
	var core, $q, constants, logger, geolocation, $scope, $templateCache, awsServices, notificationManager;

	var mock_moment;

	beforeEach(module('app'));

	beforeEach(inject(function($templateCache) {
    	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
    	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
    	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
    	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
	}));

    beforeEach(inject(function($injector) {
        mock_moment = {
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

        $q = $injector.get('$q');
        geolocation = $injector.get('geolocation');

        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
        	return $q.resolve("Narberth, PA");
        });

        constants = $injector.get('constants');
        logger = $injector.get('logger');
        awsServices = $injector.get('awsServices');
        $scope = $injector.get('$rootScope').$new();
        notificationManager = $injector.get('notificationManager');
        core = $injector.get('core');

        spyOn(notificationManager, 'notifyUploadToBestMoments');
		spyOn(logger, 'logFile').and.callFake(function(done) {
			return $q.resolve();
		});
    }));

   it('Should edit a moment', function(done) {
		spyOn(notificationManager, 'notifyUserRepliesToComment');
		spyOn(notificationManager, 'notifyUserRepliesToMoment');
		spyOn(awsServices, 'copyObject').and.callFake(function() {
			return $q.resolve();
		});
    	core.edit(mock_moment).then(function() {
    		expect(awsServices.copyObject).toHaveBeenCalledWith(mock_moment.key, mock_moment.key, mock_moment, "REPLACE");
    		done();
    	});
    	$scope.$apply();
    });

	it('Should list Moments', function(done) {
		var prefix = "test";
		var startAfter = "test"
		spyOn(awsServices, 'getMomentMetaData').and.callFake(function(key) {
			expect(key).toEqual(mock_moment.key);
			return $q.resolve();
		});
		spyOn(awsServices, 'getMoments').and.callFake(function(prefix, startAfter) {
			expect(prefix).toBe(prefix);
			expect(startAfter).toBe(startAfter);
			return $q.resolve([mock_moment]);
		});
		core.listMoments(prefix, startAfter).then(function() {
			expect(awsServices.getMomentMetaData).toHaveBeenCalled();
			done();
		});
		$scope.$apply();
	});

	it('Should get a Moment', function(done) {
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			var temp = {Metadata: mock_moment };
			expect(key).toBe(mock_moment.key);
			return $q.resolve(temp);
		});
		core.getMoment(mock_moment).then(function(moment) {
			expect(moment).toEqual(mock_moment);
			done();
		});
		$scope.$apply();
	});

	it('Should return the moment if its not found', function(done) {
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			expect(key).toBe(mock_moment.key);
			return $q.resolve("Not Found");
		});
		core.getMoment(mock_moment).then(function(moment) {
			expect(moment).toEqual("Not Found");
			done();
		});
		$scope.$apply();
	});

	it('Should get moment meta data', function(done) {
		spyOn(awsServices, 'getMomentMetaData').and.callFake(function(key) {
			expect(key).toEqual(mock_moment.key);
			done();
		});
		core.getMomentMetaData(mock_moment);
	});

    it('Should upload moments', function() {
		spyOn(awsServices, 'upload').and.callFake(function() {
			return $q.resolve();
		});
    	core.upload('', mock_moment).then(function() {
    		expect(awsServices.upload).toHaveBeenCalledWith('', mock_moment.key, mock_moment);
    	});
    	$scope.$apply();
    });

    it('Should do multipartUpload moments', function() {
		var arrayBuffer = new ArrayBuffer(1024 * 1024 * 5 * 2);

		spyOn(awsServices, 'multiPartUpload').and.callFake(function() {
			return $q.resolve();
		});
    	core.upload(arrayBuffer, mock_moment).then(function() {
    		expect(awsServices.multiPartUpload).toHaveBeenCalledWith(arrayBuffer, mock_moment.key, mock_moment);
    	});
    	$scope.$apply();
    });
});