// describe('Submit Moment', function() {
// 	var downloadManager, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices;
// 	beforeEach(module('app'));
// 	var mockLat = 40.008446;
// 	var mockLng = -75.260460;
// 	var mock_pos_coords = {
// 		coords: {
// 			latitude: mockLat,
// 			longitude: mockLng
// 		}
// 	};
// 	var mock_http_response = {
// 		data: {
// 			results: ['', '', {formatted_address: "Narberth, PA"}]
// 		}
// 	};
//     var mock_moment;

//     function createSpy() {
//         spyOn($http, 'get').and.callFake(function(url) {
//             return $q.resolve(mock_http_response);
//         });

//         spyOn(localStorage, 'getItem').and.callFake(function() {
//             return JSON.stringify(["TEST"]);
//         });
//         spyOn(awsServices, 'getObject').and.callFake(function() {
//             return $q.resolve('test');
//         });

//         spyOn(awsServices, 'upload').and.callFake(function() {
//             return $q.resolve('test');
//         });
//         spyOn(core, 'getUUID').and.callFake(function() {
//             return Math.random();
//         });
//     };

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
//     	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
//     	$templateCache.put('templates/page.html', 'layout/tabsController.html');
// 	}));

//     beforeEach(inject(function($injector) {
//     	constants = $injector.get('constants');	
//         $q = $injector.get('$q');
//         $scope = $injector.get('$rootScope').$new();
//         service = $injector.get('submitMomentService');
//         cordovaGeolocation = $injector.get('$cordovaGeolocation');
//         geolocation = $injector.get('geolocation');
//         $http = $injector.get('$http');
//         awsServices = $injector.get('awsServices');
//         core = $injector.get('core');
//         downloadManager = $injector.get('downloadManager');
//         constants.DEV_MODE = false;
//     }));

//     beforeEach(inject(function() {
//         createSpy();
        
//         geolocation.max_north.lat = 99999;
//         geolocation.max_west.lng = -99999;
//         geolocation.max_east.lng = 99999;
//         geolocation.max_south.lat = -99999;
//     }));

//     it('Should initialize the view correctly', function(done) {
//         // var mock_moment = {
//         //     Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
//         //     key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
//         //     description: "MOCK_DESCRIPTION",
//         //     likes: 900,
//         //     location: "MOCK_LOCATION",
//         //     time: 15,
//         //     uuids: "123",
//         //     views: 1000
//         // };
//         // service.
//         done();
//     });

// });