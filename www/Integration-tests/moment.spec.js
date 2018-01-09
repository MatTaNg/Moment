//Write a test for the startAfter variable
describe('Moment Service', function() {
	var localStorageManager, logger, $rootScope, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices, notificationManager, permissions, commentManager;
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

    var mock_comment;
    var mock_moment;

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
            var result = {   Body: JSON.stringify([mock_comment]) };
            return $q.resolve(result);
        });
        spyOn(awsServices, 'upload').and.callFake(function() {
            return $q.resolve('test');
        });
        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
            return $q.resolve( { town: "Narberth, PA" } );
        });
        spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
            return $q.resolve();
        });
        spyOn(core, 'getUUID').and.callFake(function() {
            return "2";
        });
        spyOn(core, 'listMoments').and.callFake(function(data) {
            return $q.resolve([{ uuids: "2" }, {uuids: "2"}, {uuids: "2"}]);
        });
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
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

        mock_comment = {
            key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
            id: "user" + new Date().getTime(),
            likes: "0",
            time: JSON.stringify(new Date().getTime()),
            uuid: 'a3052d4fa4ec79a5',
            oneSignalid: "test",
            userName: "MockUser",
            comment: "MockComment",
            commentids: "",
            parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
            replies: [],
            nativeurl: "MOCKURL"
        };

        mock_moment = {
            Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: 1000,
            location: "MOCK_LOCATION",
            time: new Date().getTime(),
            uuids: "1",
            views: 1000,
            onesignalid: "test",
            gainedLikes: 0,
            bestmoment: false,
            commentids: 'a3052d4fa4ec79a5',
        };

        geolocation.max_north.lat = 99999;
        geolocation.max_west.lng = -99999;
        geolocation.max_east.lng = 99999;
        geolocation.max_south.lat = -99999;
    }));

    function mockOutGetMoments(returnValue) {
        spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
            expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
            return $q.resolve([mock_moment, mock_moment, mock_moment]);
        });
    };

    it('Should correctly initialize the view', function(done) {
        service.momentArray.push(mock_moment);

        mockOutGetMoments([mock_moment, mock_moment, mock_moment]);

    	service.initializeView().then(function(moments) {
    		done();
    	});
    	$rootScope.$apply();
    });

    it('Should correctly initialize the view and delete expired moments', function(done) {
        mock_moment.time = 15;

        service.momentArray.push(mock_moment);
        mockOutGetMoments([mock_moment]);
        service.initializeView().then(function(moments) {
            expect(moments.length).toBe(0);
            done();
        });
        $scope.$apply();
    });

it('Should correctly initialize the view and upload to best moments', function(done) {
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