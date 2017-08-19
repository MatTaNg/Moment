// describe('Moment Service', function() {
// 	var service, core_Mock, $q, constants, logger, geolocation, $scope, $templateCache,
// 	momentArray_Mock = [1, 2, 3, 4, 5];

// 	beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
//     	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
//     	$templateCache.put('templates/page.html', 'layout/tabsController.html');
// 	}));

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

//     beforeEach(inject(function($injector) {
    	
//         $q = $injector.get('$q');
//         geolocation = $injector.get('geolocation');
//         spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
//         	return $q.resolve("Narberth, PA");
//         });
//         core_Mock = $injector.get('core');

//         constants = $injector.get('constants');
//         logger = $injector.get('logger');
//         $scope = $injector.get('$rootScope').$new();
//         service = $injector.get('momentsService');
//     }));

//     beforeEach(function() {
//     	spyOn(core_Mock, 'timeElapsed').and.returnValue("1d");
//     	spyOn(core_Mock, 'uploadToBestMoments');
//     	spyOn(core_Mock, 'removeFromBestMoments');
//     	spyOn(core_Mock, 'remove');
//     	spyOn(localStorage, 'setItem');
//     	spyOn(localStorage, 'getItem');
//     	// spyOn(service, 'removeMomentFromLocalStorage');
//     	spyOn(logger, 'logFile');
//     });

// // 	it('Should call incrementCounter momentArray is populated', function(done) {
// // 		service.momentArray = mockOutMoments();
// // 		service.incrementCounter().then(function(result) {
// // 			expect(result.length).toBe(service.momentArray.length);
// // 			for(var i = 0; i < service.momentArray.length; i++) {
// // 				expect(service.momentArray[i].key).toBe(result[i].key);
// // 				expect(service.momentArray[i].description).toBe(result[i].description);
// // 				expect(service.momentArray[i].likes).toBe(result[i].likes);
// // 				expect(service.momentArray[i].location).toBe(result[i].location);
// // 				expect(service.momentArray[i].uuids).toBe(result[i].uuids);
// // 				expect(service.momentArray[i].views).toBe(result[i].views);

// // 				expect(result[i].time).toBe("1d");			
// // 				if(i === 0) {
// // 					expect(result[i].class).toBe("layer-show");
// // 				} else if(i === 1) {
// // 					expect(result[i].class).toBe("layer-next");
// // 				} else {
// // 					expect(result[i].class).toBe("layer-hide");
// // 				}
// // 			}
// // 				done();
// // 		}, function(error) {
// // 			done();
// // 		});
// // 		$scope.$apply();
// // 	});

// // 	it('Should call incrementCounter momentArray is NOT populated', function(done) {
// // 		service.momentArray = [];
// //         service.initializeView = jasmine.createSpy("initializeView() spy").and.callFake(function() {
// //         	return $q.resolve("MOCK");
// //         });
		
// // 		service.incrementCounter().then(function(result) {
// // 			done();
// // 		});
// // 		expect(service.initializeView).toHaveBeenCalled();
// // 		$scope.$apply();
// // 	});

// // it('Should call initializeView', function(done) {
// // 	constants.DEV_MODE = true;
// // 	spyOn(service, 'getNearbyMoments').and.callFake(function() {
// // 		return $q.resolve(mockOutMoments());
// // 	});
// // 	spyOn(service, 'deleteOrUploadToBestMoments').and.callFake(function() {
// // 		return $q.resolve();
// // 	});
// // 	spyOn(service, 'checkAndDeleteExpiredMoments').and.callFake(function() {
// // 		return $q.resolve();
// // 	});
// // 	core_Mock.didUserChangeRadius = true;
// // 	service.initializeView().then(function(moments) {
// // 		expect(moments.length).toBe(4); //Moments should be removed if it matches the UUID of the users device
// // 		expect(core_Mock.didUserChangeRadius).toBe(false);
// // 		for(var i = 0; i < moments.length; i++) {
// // 			if(i === 0) {
// // 				expect(moments[i].class).toBe("layer-show");
// // 			} else if(i === 1) {
// // 				expect(moments[i].class).toBe("layer-next");
// // 			} else {
// // 				expect(moments[i].class).toBe("layer-hide");
// // 			}
// // 		}
// // 		expect(localStorage.setItem).toHaveBeenCalledWith('moments', JSON.stringify(moments));
// // 		done();
// // 	});
// // 	$scope.$apply();
// // });

// // it('Should call correctly delete and upload best Moments', function(done) {
// // 	var mocked_moments = 		
// // 		{
// // 			key: "MOCK_KEY1",
// // 			description: "MOCK_DESCRIPTION1",
// // 			likes: 50,
// // 			location: "MOCK_LOCATION1",
// // 			time: 1500609179810,
// // 			uuids: "123",
// // 			views: 100
// // 		};
// // 	service.deleteOrUploadToBestMoments([mocked_moments]).then(function() {

// // 		expect(core_Mock.removeFromBestMoments).toHaveBeenCalled();
// // 		mocked_moments = 		
// // 		{
// // 			key: "MOCK_KEY1",
// // 			description: "MOCK_DESCRIPTION1",
// // 			likes: 80,
// // 			location: "MOCK_LOCATION1",
// // 			time: 1500609179810,
// // 			uuids: "123",
// // 			views: 100
// // 		};
// // 		service.deleteOrUploadToBestMoments([mocked_moments]).then(function() {
// // 			expect(core_Mock.uploadToBestMoments).toHaveBeenCalled();
// // 			done();
// // 		});
// // 	});
// // });	

// it('Unit Testing function', function(done) {
// 	spyOn(service, 'callTest2').and.callFake(function() {
// 		console.log("FAKE TEST 2 HAS BEEN CALLED");
// 	});
// 	service.unitTester().then(function() {
// 		console.log("UNIT TESTING FUNCTION HAS RETURNED");
// 		done();
// 	});
// 	$scope.$apply();
// });

// // it('Integration Testing function', function(done) {
// // 	spyOn(service,"callTest2").and.callFake(function() {
// // 		console.log("FAKE CALLED");
// // 		return $q.resolve('1');
// // 	});
// // 	service.unitTester().then(function() {
// // 		console.log("INTEGRATION TESTING FUNCTION HAS RETURNED");
// // 		done();
// // 	});
// // });
// // it('Should remove expired moments', function(done) {
// // 	var expired_moment = 
// // 		{
// // 			key: "MOCK_KEY1",
// // 			description: "MOCK_DESCRIPTION1",
// // 			likes: 1,
// // 			location: "MOCK_LOCATION1",
// // 			time: 9999999999,
// // 			uuids: "123",
// // 			views: 1
// // 		};

// // 	service.checkAndDeleteExpiredMoments([expired_moment]).then(function() {
// // 		expect(service.removeMomentFromLocalStorage).toHaveBeenCalled();
// // 		expect(core_Mock.remove).toHaveBeenCalledWith(expired_moment);
// // 		done();
// // 	});
// // });

// // it('Should update moment on like', function() {
// // 	constants.DEV_MODE = true;
// // 	var updatedMoment = service.updateMomentMetaData(mockOutMoments()[0], true);
// // 	expect(parseInt(updatedMoment.likes)).toBe(mockOutMoments()[0].likes + 1);
// // 	expect(parseInt(updatedMoment.views)).toBe(mockOutMoments()[0].views + 1);
// // });

// // it('Should NOT update moment on DISlike', function() {
// // 	var updatedMoment = service.updateMomentMetaData(mockOutMoments()[0], false);
// // 	expect(parseInt(updatedMoment.likes)).toBe(mockOutMoments()[0].likes);
// // 	expect(parseInt(updatedMoment.views)).toBe(mockOutMoments()[0].views + 1);
// // });

// // it('updateMoment should call appropriate functions', function(done) {
// // 	var updateMomentMetaDataCalled = false;
// //     spyOn(core_Mock, 'edit').and.callFake(function() {
// //     	expect(updateMomentMetaDataCalled).toBe(true);
// // 		done();
// // 	});
// // 	spyOn(service, 'updateMomentMetaData').and.callFake(function() {
// // 		updateMomentMetaDataCalled = true;
// // 	});
// // 	service.momentArray = mockOutMoments();
// // 	service.updateMoment(true).then(function() {

// // 	});
// // });

// // it('Should upload a report', function(done) {
// // 	var mockText = "TEST";
// // 	spyOn(logger, 'logReport').and.callFake(function(report, moment, file) {
// // 		expect(report).toBe(mockText);
// // 		expect(moment).toEqual(mockOutMoments()[0]);
// // 		expect(file).toBe('flagged.txt');
// // 		done();
// // 	});
// // 	service.uploadReport(mockText, mockOutMoments()[0]);
// // });

// });