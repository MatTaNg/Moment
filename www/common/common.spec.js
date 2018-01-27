describe('Common', function() {
	var common, core, $q, constants, logger, geolocation, $scope, $templateCache, awsServices, notificationManager;

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
        common = $injector.get('common');
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

		spyOn(logger, 'logFile').and.callFake(function(done) {
			return $q.resolve();
		});
    }));

    // it("DEV_MODE should be off", function() {
    // 	expect(constants.DEV_MODE).toBe(false);
    // 	expect(constants.HOURS_BETWEEN_MOMENTS).not.toBe(0);
    // 	expect(constants.TIME_BETWEEN_NOTIFICATIONS).not.toBe(0);
    // });

    it('Should upload to best moments', function(done) {
    	var secondCopyObjCalled = false;
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			expect(key).toEqual("bestMoments/40.0014951_-75.2700205_1515996539543.jpg");
			return $q.resolve("Found");
		});
		var copyObjSpy = spyOn(awsServices, 'copyObject').and.callFake(function(key, copySource, moment, replace) {
			if(key === "bestMoments/40.0014951_-75.2700205_1515996539543.jpg") {
				expect(copySource).toEqual(mock_moment.key);
				expect(moment).toEqual(mock_moment);
				expect(replace).toEqual("REPLACE");
				expect(secondCopyObjCalled).toEqual(true);
				done();
			}
			else if(key === copySource) {
				expect(moment).toEqual(mock_moment);
				expect(replace).toEqual("REPLACE");	
				secondCopyObjCalled = true;
			}
			return $q.resolve();
		});

	   	common.uploadToBestMoments(mock_moment);
	   	$scope.$apply();
    });

    it('Should upload to best moments and notify user', function(done) {
    	var secondCopyObjCalled = false;
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			expect(key).toEqual("bestMoments/40.0014951_-75.2700205_1515996539543.jpg");
			return $q.resolve("Not Found");
		});

		spyOn(awsServices, 'copyObject').and.callFake(function(key, copySource, moment, replace) {
			if(key === "bestMoments/40.0014951_-75.2700205_1515996539543.jpg") {
				expect(copySource).toEqual(mock_moment.key);
				expect(moment).toEqual(mock_moment);
				expect(replace).toEqual("REPLACE");
				secondCopyObjCalled = true;
			}
			else if(key === copySource) {
				expect(moment).toEqual(mock_moment);
				expect(replace).toEqual("REPLACE");	
			}
			return $q.resolve();
		});
		spyOn(notificationManager, 'notifyUploadToBestMoments').and.callFake(function() {
			expect(secondCopyObjCalled).toEqual(true);
			done();		
		});
	   	common.uploadToBestMoments(mock_moment);
	   	$scope.$apply();
    });

    it('Should remove from best moments', function(done) {
        var mock_best_moment = {
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
		spyOn(awsServices, 'getMoments').and.callFake(function(prefix, startAfter) {
			expect(prefix).toEqual(constants.BEST_MOMENT_PREFIX);
			expect(startAfter).toEqual('');
			return $q.resolve([mock_best_moment]);
		});
		spyOn(awsServices, 'getMomentMetaData').and.callFake(function(key) {
			expect(key).toEqual(mock_best_moment.key);
			return $q.resolve(mock_moment);
		});
		spyOn(awsServices, 'copyObject').and.callFake(function(key, sourceKey, metaData, replace) {
			expect(key).toEqual(mock_moment.key);
			expect(sourceKey).toEqual(mock_moment.key);
			expect(metaData).toEqual(mock_moment);
			expect(replace).toEqual("REPLACE");
			done();
		});
		spyOn(awsServices, 'remove').and.callFake(function(bestMoment) {
			expect(bestMoment).toEqual(mock_best_moment.key);
			// done();
		});
    	common.removeFromBestMoments(mock_moment);
    	$scope.$apply();
    });
	
	it('Should get the timeElapsed', function() {
		var currentTime = new Date().getTime();
		var oneDay = currentTime + 86400000 + 3600000;
		var oneHour = currentTime + 3600000 + 60000;
		var oneMin = currentTime + 60000 + 1000;
		expect(common.timeElapsed(oneDay)).toEqual("1d");
		expect(common.timeElapsed(oneHour)).toEqual("1h");
		expect(common.timeElapsed(oneMin)).toEqual("1m");
		expect(common.timeElapsed(currentTime)).toEqual("0m");
	});

	it('Should convertTimeToMiliSeconds', function() {
		expect(common.convertTimeToMiliSeconds('1m')).not.toContain('m');
		expect(common.convertTimeToMiliSeconds('1h')).not.toContain('h');
		expect(common.convertTimeToMiliSeconds('1d')).not.toContain('d');
	});

	it('Should return the timeLeft', function() {
		var currentTime = new Date().getTime();
		var oneDay = currentTime + 86400000 + 3600000;
		var expiresInMiliseconds = constants.HOURS_UNTIL_MOMENT_EXPIRES * constants.MILISECONDS_IN_AN_HOUR;
		var expectedResult = common.timeElapsed(oneDay - expiresInMiliseconds);
		expect(common.timeElapsed(oneDay, true)).toEqual(expectedResult);
	});

});