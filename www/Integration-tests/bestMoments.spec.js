// describe('Moment Service', function() {
// 	var localStorageManager, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices, commentManager;
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
//         spyOn(localStorageManager, 'set').and.callFake(function() {
//             return $q.resolve();
//         });
//         spyOn(awsServices, 'getMoments').and.callFake(function() {
//             return $q.resolve(mock_moment);
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
//         service = $injector.get('bestMomentsService');
//         cordovaGeolocation = $injector.get('$cordovaGeolocation');
//         geolocation = $injector.get('geolocation');
//         $http = $injector.get('$http');
//         awsServices = $injector.get('awsServices');
//         core = $injector.get('core');
//         localStorageManager = $injector.get('localStorageManager');
//         commentManager = $injector.get('commentManager');

//         constants.DEV_MODE = false;
//     }));

//     beforeEach(inject(function() {
//         createSpy();
//         mock_comment = {
//             key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
//             id: "user" + new Date().getTime(),
//             likes: "0",
//             time: JSON.stringify(new Date().getTime()),
//             uuid: 'a3052d4fa4ec79a5',
//             oneSignalid: "test",
//             userName: "MockUser",
//             comment: "MockComment",
//             commentids: "",
//             parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             replies: [],
//             nativeurl: "MOCKURL"
//         };

//         mock_moment = {
//             Key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             description: "MOCK_DESCRIPTION",
//             likes: '1000',
//             location: "MOCK_LOCATION",
//             time: new Date().getTime(),
//             uuids: "1",
//             views: '1000',
//             onesignalid: "test",
//             gainedLikes: 0,
//             bestmoment: false,
//             commentids: 'a3052d4fa4ec79a5',
//         };
//         geolocation.max_north.lat = 99999;
//         geolocation.max_west.lng = -99999;
//         geolocation.max_east.lng = 99999;
//         geolocation.max_south.lat = -99999;
//     }));

//     it('Should correctly initialize the view', function(done) {
//         service.initializeView().then(function() {
//             done();
//         })
//         $scope.$apply();
//     });

//     it('Should load more moments', function(done) {
//         service.momentArray = [mock_moment];
//         spyOn(core, 'listMoments').and.callFake(function() {
//         	return $q.resolve([mock_moment]);
//         });
//         service.loadMore().then(function() {
//         	expect(core.listMoments).toHaveBeenCalledWith(constants.BEST_MOMENT_PREFIX, 'bestMoments/40.008446_-75.26046_1499829188066.jpg');
//             done();
//         })
//         $scope.$apply();
//     });

// });