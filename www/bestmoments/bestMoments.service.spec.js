// describe('Best Moment Service', function() {
// 	var service, geolocation, core_Mock, $q, constants, $scope, $templateCache;

// 	beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
//     	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
//     	$templateCache.put('templates/page.html', 'layout/tabsController.html');
// 	}));

//     beforeEach(function() {
//     	spyOn(localStorage, 'setItem');
//     });

//     beforeEach(inject(function($injector) {
    	
//         $q = $injector.get('$q');
//         geolocation = $injector.get('geolocation');
//         spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
//         	return $q.resolve("Narberth, PA");
//         });
//         core_Mock = $injector.get('core');

//         constants = $injector.get('constants');
//         $scope = $injector.get('$rootScope').$new();
//         service = $injector.get('bestMomentsService');
//     }));

//     function mockOutMoments() {
// 		return [
// 		{
// 			key: "MOCK_KEY1",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		},
// 		{
// 			key: "MOCK_KEY2",
// 			description: "MOCK_DESCRIPTION2",
// 			likes: 1,
// 			location: "MOCK_LOCATION2",
// 			time: 1500609179810,
// 			uuids: "321",
// 			views: 1
// 		},
// 		{
// 			key: "MOCK_KEY3",
// 			description: "MOCK_DESCRIPTION3",
// 			likes: 1,
// 			location: "MOCK_LOCATION3",
// 			time: 1500609179810,
// 			uuids: "abc",
// 			views: 1
// 		},
// 		{
// 			key: "MOCK_KEY4",
// 			description: "MOCK_DESCRIPTION3",
// 			likes: 1,
// 			location: "MOCK_LOCATION3",
// 			time: 1500609179810,
// 			uuids: "abc",
// 			views: 1
// 		},
// 		{
// 			key: "MOCK_KEY5",
// 			description: "MOCK_DESCRIPTION3",
// 			likes: 1,
// 			location: "MOCK_LOCATION3",
// 			time: 1500609179810,
// 			uuids: "abc",
// 			views: 1
// 		},
// 		];
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
// 			expect(localStorage.setItem).toHaveBeenCalledWith('bestMoments', JSON.stringify(mockOutMoments()));
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

// it('Should load more moments', function(done) {
// 	service.momentArray = mockOutMoments();
// 	spyOn(core_Mock, 'listMoments').and.callFake(function(prefix, startAfter) {
// 		expect(prefix).toEqual(constants.BEST_MOMENT_PREFIX);
// 		expect(startAfter).toEqual(constants.BEST_MOMENT_PREFIX + mockOutMoments()[mockOutMoments().length - 1].key);
// 		done();
// 	});
// 	service.loadMore();
// 	$scope.$apply();
// });

// });