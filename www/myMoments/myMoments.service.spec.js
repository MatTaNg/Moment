describe("Test myMoments Service", function() {
	var localStorageManager, downloadManager, service, core_Mock, $q, constants, logger, geolocation, $scope, $templateCache, commentManager, awsServices;

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
        downloadManager = $injector.get('downloadManager');
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('myMomentsService');
        commentManager = $injector.get('commentManager');
        awsServices = $injector.get('awsServices');
        localStorageManager = $injector.get('localStorageManager');

    }));

    beforeEach(function() {
         mock_comment = {
            key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
            id: "user" + new Date().getTime(),
            likes: "0",
            time: JSON.stringify(new Date().getTime()),
            uuid: 'a3052d4fa4ec79a5',
            onesignalid: "test",
            userName: "MockUser",
            comment: "MockComment",
            commentids: "a3052d4fa4ec79a5",
            parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
            replies: [],
            nativeurl: "MOCKURL"
        };

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

        spyOn(awsServices, 'getObject').and.callFake(function() {
            var result = { Body: JSON.stringify([mock_comment]) };
            return $q.resolve(result);
        });
    });

    it('Should initialize', function(done) {
    	spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function(moments) {
    		expect(moments).toEqual([mock_moment]);
    		return $q.resolve([mock_moment]);
    	});
        spyOn(core_Mock, 'getMoment').and.callFake(function(key) {
            if(key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
                expect(true).toEqual(true);
            }
            else if(!key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
                expect(false).toEqual(true);
            }
            var result = { Body: JSON.stringify([mock_comment]) };
            return $q.resolve(result);
        });

    	spyOn(downloadManager, "downloadFiles").and.callFake(function() {
    		return $q.resolve(mock_moment);
    	});
    	spyOn(localStorageManager, 'set').and.callFake(function(storage, value) {
    		if(storage === 'totalLikes') {
    			expect(value).toEqual(2);
    		}
    		else {
				expect(storage).toEqual('myMoments');
	    		expect(value).toEqual([mock_moment]);
    		}
    		return $q.resolve([mock_moment]);
    	});
		spyOn(localStorage, 'getItem').and.callFake(function() {
			return JSON.stringify([mock_moment]);
		});

    	service.momentArray = [mock_moment];
    	spyOn(core_Mock, 'getMomentMetaData').and.callFake(function() {
    		var temp = mock_moment;
    		temp.likes++;
    		return $q.resolve(temp);
    	});
    	service.initialize().then(function(moments) {
    		expect(moments[0].gainedLikes).toEqual(1);
    		expect(moments).toEqual([mock_moment]);
    		expect(service.getTotalLikes()).toEqual(parseInt(mock_moment.likes));
    		expect(service.getExtraLikes()).toEqual(1);
    		expect(service.momentArray[0].key).toEqual(mock_moment.key);
    		done();
    	});
    	$scope.$apply();
    });

    it('Upload bug', function(done) {
    	var bug = "MOCK";
    	spyOn(logger, 'logReport').and.callFake(function() {
    		return $q.resolve();
    	});
    	service.uploadFeedback(bug, true).then(function() {
	    	expect(logger.logReport).toHaveBeenCalledWith(bug, '', 'reports/bugs.txt');
	    	done();
    	});
    	$scope.$apply();
    });

    it('Upload feedback', function(done) {
    	var feedback = "MOCK";
    	spyOn(logger, 'logReport').and.callFake(function() {
    		return $q.resolve();
    	});
    	service.uploadFeedback(feedback, false).then(function() {
	    	expect(logger.logReport).toHaveBeenCalledWith(feedback, '', 'reports/feedback.txt');
	    	done();
    	});
    	$scope.$apply();
    });

});