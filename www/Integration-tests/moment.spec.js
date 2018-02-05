//Write a test for the startAfter variable
describe('Moment Service', function() {
	var cordovaGeolocation, common, localStorageManager, logger, $rootScope, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices, notificationManager, permissions, commentManager;
	beforeEach(module('app'));
	var mockLat = 40.008446;
	var mockLng = -75.260460;
	var mock_pos_coords = {
		coords: {
			latitude: mockLat,
			longitude: mockLng
		}
	};
	var mock_http_response = {
		data: {
			results: [{ address_components: [{short_name: "PA"}] }, '', {formatted_address: "Narberth, PA"}]
		}
	};

    function createSpy() {
        spyOn($http, 'get').and.callFake(function(url) {
            return $q.resolve(mock_http_response);
        });
        spyOn(localStorage, 'getItem').and.callFake(function() {
            return JSON.stringify(["TEST"]);
        });
        // spyOn(awsServices, 'getObject').and.callFake(function() {
        //     return $q.resolve('test');
        // });
        spyOn(awsServices, 'getObject').and.callFake(function() {
            var result = {   Body: JSON.stringify([createMockComment()]) };
            return $q.resolve(result);
        });
        spyOn(awsServices, 'upload').and.callFake(function() {
            return $q.resolve('test');
        });
        // spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
        //     return $q.resolve( { town: "Narberth, PA" } );
        // });
		spyOn(cordovaGeolocation, 'getCurrentPosition').and.callFake(function() {
			return $q.resolve(mock_pos_coords);
		});
		spyOn(permissions, 'checkPermission').and.callFake(function() {
			return $q.resolve();
		});
        spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
            return $q.resolve();
        });
        spyOn(common, 'getUUID').and.callFake(function() {
            return "2";
        });
        spyOn(core, 'listMoments').and.callFake(function(data) {
            return $q.resolve([{ uuids: "2" }, {uuids: "2"}, {uuids: "2"}]);
        });
        spyOn(awsServices, 'copyObject').and.callFake(function() {
            return $q.resolve([mock_moment]);
        });
        spyOn(logger, 'logFile').and.callFake(function() {
            return $q.resolve();
        });
        spyOn(awsServices, 'remove').and.callFake(function() {
            return $q.resolve();
        });
        spyOn(notificationManager, 'notifyUploadToBestMoments').and.callFake(function(id, msg) {
            expect(id).toEqual(mock_moment.onesignalid);
            expect(msg).toEqual(constants.MOMENT_BECOMES_BEST_MOMENT);
        });
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
    	cordovaGeolocation = $injector.get('$cordovaGeolocation');
    	common = $injector.get('common');
    	constants = $injector.get('constants');	
        $q = $injector.get('$q');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('momentsService');
        cordovaGeolocation = $injector.get('$cordovaGeolocation');
        geolocation = $injector.get('geolocation');
        $http = $injector.get('$http');
        awsServices = $injector.get('awsServices');
        core = $injector.get('core');
        $rootScope = $injector.get('$rootScope');
        localStorageManager = $injector.get('localStorageManager');
        notificationManager = $injector.get('notificationManager');
        logger = $injector.get('logger');
        permissions = $injector.get('permissions');
        commentManager = $injector.get('commentManager');

        constants.DEV_MODE = false;
    }));

    beforeEach(inject(function() {
        createSpy();

        geolocation.max_north = {lat: 99999};
        geolocation.max_west = {lng: -99999};
        geolocation.max_east = {lng: 99999};
        geolocation.max_south = {lat: -99999};
    }));

	function createMockComment() {
		return {
            key: "comments/a3052d4fa4ec79a5/40.008446_-75.26046_1499829188066.txt",
            id: "user" + new Date().getTime(),
            likes: "0",
            time: JSON.stringify(new Date().getTime()),
            uuid: 'a3052d4fa4ec79a5',
            onesignalid: "test",
            userName: "MockUser",
            comment: "MockComment",
            commentids: "a3052d4fa4ec79a5",
            parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
			likesuuids: '',
            likedClass: 'ion-android-favorite-outline'
        };
	}

	function createMockMoment() {
		return {
			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime().toString(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'a3052d4fa4ec79a5',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
        };
	};

    function mockOutGetMoments(returnValue) {
        spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
            expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
            return $q.resolve([mock_moment, mock_moment, mock_moment]);
        });
    };

    function makeGetTimesMockable(returnedMoments, mockedMoments) {
        var result = [];
        for(var x = 0; x < returnedMoments.length; x++) {
            returnedMoments[x].time = common.timeElapsed(returnedMoments[x].time);
            var returnedComments = returnedMoments[x].comments;
            for(var y = 0; y < returnedComments.length; y++) {
                returnedComments[y].time = common.timeElapsed(returnedComments[y].time);
                returnedComments[y].id = returnedComments[y].id.substring(0, returnedComments[y].id.length - 2);
                var returnedReplies = returnedComments[y].replies;
                for(var z = 0; z < returnedReplies.length; z++) {
                    returnedReplies[z].time = common.timeElapsed(returnedReplies[z].time);
                    returnedReplies[z].id = returnedReplies[z].id.substring(0, returnedReplies[z].id.length - 2);
                }
            }
        }
        for(var x = 0; x < mockedMoments.length; x++) {
            mockedMoments[x].comments = [createMockComment()];
            mockedMoments[x].time = common.timeElapsed(mockedMoments[x].time);
            var mockedComments = mockedMoments[x].comments;
            for(var y = 0; y < mockedComments.length; y++) {
                mockedMoments[x].comments[y].replies = [createMockComment()];
                mockedComments[y].time = common.timeElapsed(mockedComments[y].time);
                mockedComments[y].id = mockedComments[y].id.substring(0, mockedComments[y].id.length - 2);
                var mockedReplies = mockedComments[y].replies;
                for(var z = 0; z < mockedComments.length; z++) {
                    mockedReplies[z].time = common.timeElapsed(mockedReplies[z].time);
                    mockedReplies[z].id = mockedReplies[z].id.substring(0, mockedReplies[z].id.length - 2);
                }
            }
        }

    }

    it('Should correctly initialize the view', function(done) {
	    var mock_comment = createMockComment();
		var mock_moment = createMockMoment();
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        service.momentArray.push(mock_moment);

        mockOutGetMoments([mock_moment, mock_moment, mock_moment]);

    	service.initializeView().then(function(moments) {
            var expected = [createMockMoment(), createMockMoment(), createMockMoment()];
            makeGetTimesMockable(moments, expected);
            mock_moment.comments[0].replies = [createMockComment()];
    		expect(moments).toEqual(expected);
    		done();
    	});
    	$rootScope.$apply();
    });

    it('Should correctly initialize the view and delete expired moments', function(done) {
    	var mock_comment = createMockComment();
    	var mock_moment = createMockMoment();
        mock_moment.time = 15;

        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });


        service.momentArray.push(mock_moment);

        mockOutGetMoments([mock_moment]);
        service.initializeView().then(function(moments) {
            expect(moments.length).toBe(0);
            done();
        });
        $scope.$apply();
    });

it('Should correctly initialize the view and upload to best moments', function(done) {
        var mock_comment = createMockComment();
    	var mock_moment = createMockMoment();
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        mock_moment.likes = 900;
        mock_moment.views = 20;

        spyOn(common, 'uploadToBestMoments');

        mockOutGetMoments([mock_moment]);

        service.initializeView().then(function(moments) {
            expect(moments[0].key).toEqual(mock_moment.key);
            expect(common.uploadToBestMoments).toHaveBeenCalled();
            done();
        });
        $scope.$apply();
    });

it('Should correctly initialize the view and remove moment from best moments', function(done) {
        var mock_comment = createMockComment();
		var mock_moment = createMockMoment();
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        mock_moment.likes = 400;
        mock_moment.views = 1000;

        spyOn(common, 'removeFromBestMoments');

        mockOutGetMoments([mock_moment]);

        service.momentArray = [mock_moment];

        service.initializeView().then(function(moments) {
            expect(moments[0].key).toEqual(mock_moment.key);
            expect(common.removeFromBestMoments).toHaveBeenCalled();
            done();
        });
        $rootScope.$apply();
    });

});