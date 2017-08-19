describe('Moment Service', function() {
	var service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices;
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
			results: ['', '', {formatted_address: "Narberth, PA"}]
		}
	};
	var mock_moment = {
			Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
			description: "MOCK_DESCRIPTION",
			likes: 1,
			location: "MOCK_LOCATION",
			time: 15,
			uuids: "123",
			views: 1
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
        $http = $injector.get('$http');
        awsServices = $injector.get('awsServices');

        constants.DEV_MODE = false;
    }));

    beforeEach(inject(function() {
    	var deferred = $q.defer();

    	spyOn(cordovaGeolocation, 'getCurrentPosition').and.callFake(function() {
    		return $q.resolve(mock_pos_coords);
    	});
    	spyOn($http, 'get').and.callFake(function(url) {
    		// expect(url).toEqual(constants.GEOLOCATION_URL + "latlng=" + mockLat + "," + mockLng);
    		return $q.resolve(mock_http_response);
    	});
        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            console.log("MOCKED");
            return $q.resolve(mock_moment);
        });
        spyOn(localStorage, 'setItem').and.callFake(function() {
            console.log("ASDASDSA");
        });
        spyOn(localStorage, 'getItem').and.callFake(function() {
            console.log("ZXCZXCZ");
            return JSON.stringify(["TEST"]);
        });
        spyOn(awsServices, 'getObject').and.callFake(function() {
            // console.log("MOCK GET OBJECT");
            // var deferred = $q.defer();
            // deferred.resolve('test');
            // return deferred.promise;
            return $q.resolve('test');
            // $q.resolve('test');
        });
		// spyOn(awsServices, 'getObject').and.returnValue(deferred.promise);
        spyOn(awsServices, 'upload').and.callFake(function() {
            console.log("MOCK UPLOAD");
            return $q.resolve('test');
        });
        spyOn(awsServices, 'remove').and.callFake(function() {
        	console.log("REMOVE MOCKED");
            return $q.resolve('test');
        });
    }));

    it('Should correctly initialize the view', function(done) {
        var deferred = $q.defer();
        deferred.resolve('test');
    	spyOn(awsServices, 'getMoments').and.callFake(function(key, startAfter) {
    		expect(key).toEqual(constants.MOMENT_PREFIX + 'Narberth');
    		expect(startAfter).toEqual('');
            var deferred = $q.defer();
            deferred.resolve([mock_moment]);
            return deferred.promise;
    		// return Promise.resolve(mock_moment);
    	});
    	service.initializeView().then(function(moments) {
    		console.log("moments");
    		done();
    	});
    	$scope.$apply();
    });

});