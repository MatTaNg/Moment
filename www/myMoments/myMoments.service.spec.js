// describe("Test myMoments Service", function() {
// 	var service, core_Mock, $q, constants, logger, geolocation, $scope, $templateCache;

// 	beforeEach(module('app'));

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

//         constants = $injector.get('constants');
//         logger = $injector.get('logger');
//         $scope = $injector.get('$rootScope').$new();
//         service = $injector.get('myMomentsService');
//     }));

// //Does not work
//     it('Should initialize', function(done) {
//     	var mocked_Moment = 		
//     	{
// 			key: "MOCK_KEY",
// 			description: "MOCK_DESCRIPTION",
// 			likes: 1,
// 			location: "MOCK_LOCATION",
// 			time: 1500609179810,
// 			uuids: "123",
// 			views: 1
// 		};
//     	service.momentArray = [mocked_Moment];
//     	spyOn(core_Mock, 'getMoment').and.callFake(function() {
//     		return $q.resolve(mocked_Moment);
//     	});
//     	service.initialize().then(function() {
//     		//initialize does not return
//     		console.log("INIT");
//     		expect(service.getTotalLikes()).toEqual(parseInt(mocked_Moment.likes));
//     		expect(service.getExtraLikes()).toEqual(0);
//     		expect(service.momentArray[0]).toEqual(jasmine.objectContaining({
//     			shortDescription: "MOCK_DESCRIPTION"
//     		}));
//     		done();
//     	});
//     	$scope.$apply();
//     });

//     it('Upload bug', function(done) {
//     	var bug = "MOCK";
//     	spyOn(logger, 'logReport').and.callFake(function() {
//     		return $q.resolve();
//     	});
//     	service.uploadFeedback(bug, true).then(function() {
// 	    	expect(logger.logReport).toHaveBeenCalledWith(bug, 'reports/bugs.txt');
// 	    	done();
//     	});
//     	$scope.$apply();
//     });

//     it('Upload feedback', function(done) {
//     	var feedback = "MOCK";
//     	spyOn(logger, 'logReport').and.callFake(function() {
//     		return $q.resolve();
//     	});
//     	service.uploadFeedback(feedback, false).then(function() {
// 	    	expect(logger.logReport).toHaveBeenCalledWith(feedback, 'reports/feedback.txt');
// 	    	done();
//     	});
//     	$scope.$apply();
//     });

// });