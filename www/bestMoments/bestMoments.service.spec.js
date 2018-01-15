// describe('Best Moment Service', function() {
// 	var localStorageManager, service, geolocation, core_Mock, $q, constants, $scope, $templateCache, commentManager;

// 	beforeEach(module('app'));

//     var mock_comment = {
//         key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
//         id: "user" + new Date().getTime(),
//         likes: "0",
//         time: JSON.stringify(new Date().getTime()),
//         uuid: 'a3052d4fa4ec79a5',
//         onesignalid: "test",
//         userName: "MockUser",
//         comment: "MockComment",
//         commentids: "",
//         parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
//         replies: []
//     };

//     var mock_moment = {
//         Key: "bestMoments/40.008446_-75.26046_1499829188066.jpg",
//         key: "bestMoments/40.008446_-75.26046_1499829188066.jpg",
//         description: "MOCK_DESCRIPTION",
//         likes: '1000',
//         location: "MOCK_LOCATION",
//         time: new Date().getTime(),
//         uuids: "1",
//         views: '1000',
//         onesignalid: "test",
//         gainedLikes: 0,
//         bestmoment: false,
//         commentids: 'a3052d4fa4ec79a5',
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
    	
//         $q = $injector.get('$q');
//         geolocation = $injector.get('geolocation');
//         spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
//         	return $q.resolve("Narberth, PA");
//         });
//         core_Mock = $injector.get('core');
//         commentManager = $injector.get('commentManager');
//         constants = $injector.get('constants');
//         $scope = $injector.get('$rootScope').$new();
//         service = $injector.get('bestMomentsService');
//         localStorageManager = $injector.get('localStorageManager');
//     }));

//     beforeEach(function() {
//     	spyOn(localStorageManager, 'set').and.callFake(function() {
//     		return $q.resolve();
//     	});
//     });

//     function mockOutMoments() {
// 		return [mock_moment, mock_moment, mock_moment, mock_moment, mock_moment];
//     };

// 	it('Should initialize moments', function(done) {
// 		service.momentArray = mockOutMoments();
// 		spyOn(core_Mock, 'getMomentMetaData').and.callFake(function() {
// 			return $q.resolve(mockOutMoments());
// 		});
// 		spyOn(core_Mock, 'listMoments').and.callFake(function() {
// 			return $q.resolve(mockOutMoments());
// 		});	
// 		service.initializeView().then(function() {
// 			expect(localStorageManager.set).toHaveBeenCalled();
// 			expect(service.momentArray.length).toEqual(mockOutMoments().length);
// 			for(var i = 0; i < service.momentArray.length; i++) {
// 				expect(service.momentArray[i].key).toEqual(mockOutMoments()[i].key);
// 				expect(service.momentArray[i].likes).toEqual(mockOutMoments()[i].likes);
// 				expect(service.momentArray[i].views).toEqual(mockOutMoments()[i].views);
// 				expect(service.momentArray[i].location).toEqual(mockOutMoments()[i].location);
// 				expect(service.momentArray[i].time).toEqual(mockOutMoments()[i].time);
// 				expect(service.momentArray[i].description).toEqual(mockOutMoments()[i].description);
// 				expect(service.momentArray[i].uuids).toEqual(mockOutMoments()[i].uuids);
// 			}
// 			done();
// 		});
// 		$scope.$apply();
// 	});

// it('Should load more', function(done) {
// 	service.momentArray = mockOutMoments();
// 	spyOn(core_Mock, 'listMoments').and.callFake(function(prefix, startAfter) {
// 		expect(prefix).toEqual(constants.BEST_MOMENT_PREFIX);
// 		expect(startAfter).toEqual(mockOutMoments()[mockOutMoments().length - 1].key);
// 		done();
// 	});
// 	service.loadMore();
// 	$scope.$apply();
// });

// });