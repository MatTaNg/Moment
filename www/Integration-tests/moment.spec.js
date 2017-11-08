//Write a test for the startAfter variable
describe('Moment Service', function() {
	var localStorageManager, logger, $rootScope, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices;
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
        logger = $injector.get('logger');

        constants.DEV_MODE = false;
    }));

    beforeEach(inject(function() {
    	var deferred = $q.defer();

    	spyOn($http, 'get').and.callFake(function(url) {
    		return $q.resolve(mock_http_response);
    	});

        spyOn(localStorage, 'getItem').and.callFake(function() {
            return JSON.stringify(["TEST"]);
        });
        spyOn(awsServices, 'getObject').and.callFake(function() {
            return $q.resolve('test');
        });

        spyOn(awsServices, 'upload').and.callFake(function() {
            return $q.resolve('test');
        });
        spyOn(core, 'getUUID').and.callFake(function() {
            return Math.random();
        });

        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
            return $q.resolve( { town: "Narberth, PA" } );
        });
        spyOn(localStorageManager, 'addandDownload').and.callFake(function() {
            return $q.resolve();
        });

        geolocation.max_north.lat = 99999;
        geolocation.max_west.lng = -99999;
        geolocation.max_east.lng = 99999;
        geolocation.max_south.lat = -99999;
    }));

    it('Should correctly initialize the view', function(done) {
        var mock_moment = {
            Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: 1000,
            location: "MOCK_LOCATION",
            time: new Date().getTime(),
            uuids: "123",
            views: 1000
        };
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        spyOn(awsServices, 'copyObject').and.callFake(function() {
            return $q.resolve([mock_moment]);
        });

        var deferred = $q.defer();
        service.momentArray.push(mock_moment);
        spyOn(logger, 'logFile').and.callFake(function() {
            return $q.resolve();
        })
    	spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
    		expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
    		// expect(startAfter).toEqual('moment/PA/40.008446_-75.26046_1499829188066.jpg');
            var deferred = $q.defer();
            deferred.resolve([mock_moment, mock_moment, mock_moment]);
            return deferred.promise;
    	});
    	service.initializeView().then(function(moments) {
    		done();
    	});
    	$rootScope.$apply();
    });

    it('Should correctly initialize the view and delete expired moments', function(done) {
        var mock_moment = {
            Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: 1000,
            location: "MOCK_LOCATION",
            time: 15,
            uuids: "123",
            views: 1000
        };
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        spyOn(awsServices, 'copyObject').and.callFake(function() {
            return $q.resolve([mock_moment]);
        });

        spyOn(awsServices, 'remove').and.callFake(function() {
            return $q.resolve();
        })

        var deferred = $q.defer();
        service.momentArray.push(mock_moment);
        spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
            expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
            var deferred = $q.defer();
            deferred.resolve([mock_moment]);
            return deferred.promise;
        });
        service.initializeView().then(function(moments) {
            expect(moments.length).toBe(0);
            done();
        });
        $scope.$apply();
    });

it('Should correctly initialize the view and upload to best moments', function(done) {
        var mock_moment = {
            Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: 900,
            location: "MOCK_LOCATION",
            time: new Date().getTime(),
            uuids: "123",
            views: 20
        };
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        spyOn(awsServices, 'copyObject').and.callFake(function() {
            return $q.resolve([mock_moment]);
        });

        spyOn(awsServices, 'remove').and.callFake(function() {
            return $q.resolve(); 
        });

        spyOn(core, 'uploadToBestMoments');

        var deferred = $q.defer();
        spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
            expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
            expect(startAfter).toEqual('');
            var deferred = $q.defer();
            deferred.resolve([mock_moment]);
            return deferred.promise;
        });
        service.initializeView().then(function(moments) {
            expect(moments[0].key).toEqual(mock_moment.key);
            expect(core.uploadToBestMoments).toHaveBeenCalled();
            done();
        });
        $scope.$apply();
    });

it('Should correctly initialize the view and remove moment from best moments', function(done) {
        var mock_moment = {
            Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: 400,
            location: "MOCK_LOCATION",
            time: new Date().getTime(),
            uuids: "123",
            views: 1000
        };
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve(mock_moment);
        });

        spyOn(awsServices, 'remove').and.callFake(function() {
            return $q.resolve();
        });

        spyOn(core, 'removeFromBestMoments');

        var deferred = $q.defer();
        spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
            expect(key).toEqual(constants.MOMENT_PREFIX + 'PA');
            var deferred = $q.defer();
            deferred.resolve([mock_moment]);
            return deferred.promise;
        });
        service.initializeView().then(function(moments) {
            expect(moments[0].key).toEqual(mock_moment.key);
            expect(core.removeFromBestMoments).toHaveBeenCalled();
            done();
        });
        $rootScope.$apply();
    });

//     it('Should successfully upload Report', function() {
//     });

    function areMomentsCorrectlyInitialized(moments) {
        for(var i = 0; i  < moments.length; i++) {
        if(i === 0)
            expect(moments[i].class).toEqual('layer-top');    
        if(i === 1)
            expect(moments[i].class).toEqual('layer-next');    
        if(i > 1)
            expect(moments[i].class).toEqual('layer-hide');    
        }
    }

});