describe("Geolocation", function() {
	var permissions, $q, constants, logger, geolocation, $scope, $templateCache, $http, awsServices;

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
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        $http = $injector.get('$http');
        $cordovaGeolocation = $injector.get('$cordovaGeolocation');
        awsService = $injector.get('awsServices');
        $scope = $injector.get('$rootScope').$new();
        awsServices = $injector.get('awsServices');
        geolocation = $injector.get('geolocation');
        permissions = $injector.get('permissions');
    }));

    beforeEach(function() {
    	spyOn(localStorage, 'setItem');
    	spyOn(localStorage, 'getItem');
    	spyOn(logger, 'logFile');
    });

    it('Should call getLocation and initializeUserLocation', function(done) {
    	spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
    		return $q.resolve("TEST");
    	});
    	geolocation.getLocation().then(function(location) {
    		expect(location).toEqual("TEST");
    		done();
    	});
    	$scope.$apply();
    });

    it('Should call getLocation and getCoordinatesFromTown', function(done) {
    	spyOn(geolocation, 'getCoordinatesFromTown').and.callFake(function() {
    		return $q.resolve({ lat: 1, lng: 1});
    	});
    	geolocation.getLocation("Wynnewood, PA").then(function(location) {
    		expect(location).toEqual({ lat: 1, lng: 1});
    		done();
    	});
    	$scope.$apply();
    });

    it('Should call getLocation and getCoordsFromZipCode', function(done) {
    	spyOn(geolocation, 'getCoordsFromZipCode').and.callFake(function() {
    		return $q.resolve({ lat: 1, lng: 1});
    	});
    	geolocation.getLocation("07670").then(function(location) {
    		expect(location).toEqual({ lat: 1, lng: 1});
    		done();
    	});
    	spyOn(geolocation, "setMaxNESW").and.callFake(function(lat, lng) {
    		expect(lat).toEqual(1);
    		expect(lng).toEqual(1);
    	});
    	$scope.$apply();
    });

	it("Get current Lat Long", function(done) {
		spyOn($cordovaGeolocation, 'getCurrentPosition').and.callFake(function() {
    		return $q.resolve({
    			coords: { 
    					  latitude: 1,
    			 		  longitude: 1
    			 		}
    		});
    	});
		constants.DEV_MODE = false;
		geolocation.getCurrentLatLong().then(function(coords) {
			expect(coords.lat).toEqual(1);
			expect(coords.lng).toEqual(1);
			done();
		});
		$scope.$apply();
	});

	it('Get current Lat Long in DEV_MODE', function(done) {
		constants.DEV_MODE = true;
		geolocation.getCurrentLatLong().then(function(coords) {
			expect(coords.lat).toEqual(constants.MOCKED_COORDS.lat);
			expect(coords.lng).toEqual(constants.MOCKED_COORDS.lng);
			expect(coords.town).toEqual(constants.MOCKED_COORDS.town);
			expect(coords.state).toEqual(constants.MOCKED_COORDS.state);
			done();
		});
		$scope.$apply();
	});

	it('Should get States', function(done) {
		spyOn(geolocation, 'getLocationFromCoords').and.callFake(function() {
			return $q.resolve({
				state: "PA"
			});
		});
		geolocation.getStates().then(function(states) {
			expect(states.north).toEqual("PA");
			expect(states.south).toEqual("PA");
			expect(states.west).toEqual("PA");
			expect(states.east).toEqual("PA");
			done();
		});
		$scope.$apply();
	});

	it('Should initializeUserLocation', function(done) {
		var mock_lat = "1";
		var mock_lng = "1";
		var mock_town = "Narberth, PA";
		spyOn(geolocation, "getCurrentLatLong").and.callFake(function() {
			return $q.resolve({
				lat: mock_lat,
				lng: mock_lng
			});
		});
		spyOn(geolocation, "getLocationFromCoords").and.callFake(function(lat, lng) {
			expect(lat).toEqual(mock_lat);
			expect(lng).toEqual(mock_lng);
			return $q.resolve({
				town: mock_town
			});
		});
		spyOn(permissions, 'checkPermission').and.callFake(function() {
			return $q.resolve();
		});
		geolocation.initializeUserLocation().then(function(location) {
			expect(location.lat).toEqual(mock_lat);
			expect(location.lng).toEqual(mock_lng);
			expect(location.town).toEqual(mock_town);
			done();
		});
		$scope.$apply();
	});

	it('Should get calculateNearbyStates', function(done) {
		spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
			return $q.resolve({
				lat: "1",
				lng: "1"
			})
		})
		spyOn(geolocation, 'getStates').and.callFake(function() {
			return $q.resolve({
				north: "PA",
				south: "PA",
				west: "PA",
				east: "PA"
			});
		});
		geolocation.calculateNearbyStates().then(function(states) {
			expect(states).toEqual(['PA']);
			done();
		});
		$scope.$apply();
	});

	it('Should get moments by state', function(done) {
		spyOn(awsServices, "getMoments").and.callFake(function(prefix, startAfter) {
			expect(constants.MOMENT_PREFIX + 'PA');
			expect(startAfter).toEqual('');
			return $q.resolve();
		});
		geolocation.getMomentsByState('', ["PA"]).then(function() {
			done();
		});
		$scope.$apply();
	});

	it('Should get moments within radius', function(done) {
		var mockMoment = {
			Key: "MOCK_KEY1",
			key: "MOCK_KEY1",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: "1d",
			uuids: "123",
			views: 1
		};
		geolocation.max_north.lat = 99999;
		geolocation.max_south.lat = -99999;
		geolocation.max_west.lng = -99999;
		geolocation.max_east.lng = 99999;
		spyOn(awsServices, 'getMomentMetaData').and.callFake(function(key) {
			expect(key).toEqual("https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg");
			done();
			return $q.resolve(mockMoment);
		});
		geolocation.getMomentsWithinRadius([
		{
			Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
			description: "MOCK_DESCRIPTION3",
			likes: 1,
			location: "MOCK_LOCATION3",
			time: 1500609179810,
			uuids: "abc",
			views: 1
		}
		]);
		$scope.$apply();
	});

	it('Should get coordinates from town', function(done) {
		mockOutHTTPGet("Narberth, PA");
		geolocation.getCoordinatesFromTown("Narberth, PA").then(function(coordinates) {
			expect(coordinates.town).toEqual("Narberth");
			expect(coordinates.lat).toEqual(1);
			expect(coordinates.lng).toEqual(1);
			done();
		});
		$scope.$apply();		
	});

	it('Should fail to get coordinates from town if Rd is in the name', function(done) {
		mockOutHTTPGet("Narberth, PA, Rd");
		geolocation.getCoordinatesFromTown("Narberth, PA, Rd").then(function(coordinates) {
		}, function(error) {
			done();
		});
		$scope.$apply();
	});

	var mockOutHTTPGet = function(address) {
		spyOn($http, "get").and.callFake(function() {
			return $q.resolve({
				data: {
					results: [{
						address_components: [ { short_name: "PA" } ],
						formatted_address: address,
						geometry: {
							location: {
								lat: 1,
								lng: 1
							}
						}
					}]
				}
			})
		});
	};

});