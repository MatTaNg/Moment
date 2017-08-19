// describe('Core', function() {
// 	var core, $q, constants, logger, geolocation, $scope, $templateCache, awsServices;

// 	beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
// 	}));

//     beforeEach(inject(function($injector) {
//         $q = $injector.get('$q');
//         geolocation = $injector.get('geolocation');
//         spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
//         	return $q.resolve("Narberth, PA");
//         });

//         constants = $injector.get('constants');
//         logger = $injector.get('logger');
//         awsServices = $injector.get('awsServices');
//         $scope = $injector.get('$rootScope').$new();
//         core = $injector.get('core');
//     }));

//     beforeEach(function() {
//     });

//     it('Should split URL off key', function() {
//     	var sampleKey = "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg";
//     	var key = core.splitUrlOff(sampleKey);
//     	expect("moment/PA/40.008446_-75.26046_1499829188066.jpg", key);
//     	expect(core.splitUrlOff(core.splitUrlOff(sampleKey))).toBe("moment/PA/40.008446_-75.26046_1499829188066.jpg");
//     });

//     it('Should edit a moment', function(done) {
// 		var mock_moment = {
// 			key: "MOCK_KEY1",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(core, 'splitUrlOff').and.returnValue(mock_moment.key);
// 		spyOn(awsServices, 'copyObject').and.callFake(function() {
// 			return $q.resolve();
// 		});
//     	core.edit(mock_moment).then(function() {
//     		expect(awsServices.copyObject).toHaveBeenCalledWith(mock_moment.key, mock_moment.key, mock_moment, "REPLACE");
//     		done();
//     	});
//     	$scope.$apply();
//     });

//     it('Should upload moments', function() {
//     	var mock_moment = {
// 			key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(core, "splitUrlOff").and.returnValue(mock_moment.key);
// 		spyOn(awsServices, 'upload').and.callFake(function() {
// 			return $q.resolve();
// 		});
//     	core.upload('', mock_moment).then(function() {
//     		expect(awsServices.upload).toHaveBeenCalledWith('', mock_moment.key, mock_moment);
//     	});
//     	$scope.$apply();
//     });

//     it('Should upload to best moments', function() {
//     	var mock_moment = {
// 			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(logger, 'logFile').and.callFake(function(done) {
// 			return $q.resolve();
// 		});
// 		spyOn(core, 'splitUrlOff').and.returnValue(mock_moment.key);
// 		spyOn(awsServices, 'copyObject').and.callFake(function(key, copySource, moment, replace) {
// 			expect(key).toEqual("bestMoments/40.008446_-75.26046_1499829188066.jpg");
// 			expect(copySource).toEqual(mock_moment.key);
// 			expect(moment).toEqual(mock_moment);
// 			expect(replace).toEqual("REPLACE");
// 		});

// 	   	core.uploadToBestMoments(mock_moment);
// 	   	$scope.$apply();
//     });

//     it('Should remove from best moments', function(done) {
//     	var mock_moment = {
// 			key: "bestMoment/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		var mock_best_moments = [{
// 			Key: "bestMoment/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		}, {
// 			Key: "bestMoment/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		}];
// 		spyOn(awsServices, 'getMoments').and.callFake(function() {
// 			return $q.resolve(mock_best_moments);
// 		});
// 		spyOn(core, 'remove').and.callFake(function(bestMoment) {
// 			expect(bestMoment).toEqual(mock_best_moments[0]);
// 			done();
// 		});
//     	core.removeFromBestMoments(mock_moment);
//     	$scope.$apply();
//     });
	
// 	it('Should list Moments', function(done) {
// 		var prefix = "test";
// 		var startAfter = "test"
// 		spyOn(awsServices, 'getMoments').and.callFake(function(prefix, startAfter) {
// 			expect(prefix).toBe(prefix);
// 			expect(startAfter).toBe(startAfter);
// 			done();
// 		});
// 		core.listMoments(prefix, startAfter);
// 	});

// 	it('Should get a Moment', function(done) {
//     	var mock_moment = {
// 			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(awsServices, 'getObject').and.callFake(function(key) {
// 			expect(key).toBe(mock_moment.key);
// 			return $q.resolve({
// 				MetaData: mock_moment 
// 			});
// 		});
// 		core.getMoment(mock_moment).then(function(moment) {
// 			expect(moment).toEqual(mock_moment);
// 			done();
// 		});
// 		$scope.$apply();
// 	});

// 	it('Should return the moment if its not found', function(done) {
// 		var mock_moment = {
// 			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(awsServices, 'getObject').and.callFake(function(key) {
// 			expect(key).toBe(mock_moment.key);
// 			return $q.resolve("Not Found");
// 		});
// 		core.getMoment(mock_moment).then(function(moment) {
// 			expect(moment).toEqual("Not Found");
// 			done();
// 		});
// 		$scope.$apply();
// 	});

// 	it('Should get moment meta data', function(done) {
// 		var mock_moment = {
// 			Key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
// 			description: "MOCK_DESCRIPTION1",
// 			likes: 1,
// 			location: "MOCK_LOCATION1",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
// 		spyOn(awsServices, 'getMomentMetaData').and.callFake(function(key) {
// 			expect(key).toEqual(mock_moment.Key);
// 			done();
// 		});
// 		core.getMomentMetaData(mock_moment);
// 	});

// 	it('Should get the timeElapsed', function() {
// 		var currentTime = new Date().getTime();
// 		var oneDay = currentTime + 86400000 + 3600000;
// 		var oneHour = currentTime + 3600000 + 60000;
// 		var oneMin = currentTime + 60000 + 1000;
// 		expect(core.timeElapsed(oneDay)).toEqual("1d");
// 		expect(core.timeElapsed(oneHour)).toEqual("1h");
// 		expect(core.timeElapsed(oneMin)).toEqual("1m");
// 		expect(core.timeElapsed(currentTime)).toEqual("0m");
// 	});

// 	it("Should get users UUID", function() {
// 		constants.DEV_MODE = true;
// 		expect(core.getUUID()).toBe("123");
// 	});

// });