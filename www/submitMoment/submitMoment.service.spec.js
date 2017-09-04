describe("Submit moment service", function() {
	var service, $q, core_Mock, constants, logger, $scope, $templateCache;

	beforeEach(module('app'));

	beforeEach(inject(function($templateCache) {
    	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
    	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
    	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
    	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
	}));

    beforeEach(inject(function($injector) {
    	$q = $injector.get('$q');
        geolocation = $injector.get('geolocation');
        spyOn(geolocation, 'initializeUserLocation').and.callFake(function() {
        	return $q.resolve("Narberth, PA");
        });
        core_Mock = $injector.get('core');
        constants = $injector.get('constants');
        logger = $injector.get('logger');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('submitMomentService');
    }));

    beforeEach(function() {
    	spyOn(localStorage, 'setItem')
    	spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(["MOCK"]));
    });

    it('Should upload to local storage', function() {
    	var mock_moment = {
			key: "MOCK_KEY5",
			description: "MOCK_DESCRIPTION3",
			likes: 1,
			location: "MOCK_LOCATION3",
			time: 1500609179810,
			uuids: "abc",
			views: 1
		};
    	service.uploadToLocalStorage(mock_moment);
    	expect(localStorage.getItem).toHaveBeenCalledWith('myMoments');
    	expect(localStorage.setItem).toHaveBeenCalledWith('myMoments', JSON.stringify(["MOCK", mock_moment]));
    });

  //   it('Should upload to AWS', function() {
  //   	spyOn(core_Mock, 'upload').then(function() {
  //   		console.log("QWEQWEQWEWQ");
  //   		return $q.resolve();
  //   	});
  //   	spyOn(service, 'dataURItoBlob').and.callFake(function() {
  //   		return new Blob(["Mock"]);
  //   	});
  //   	var mock_moment = {
		// 	key: "MOCK_KEY5",
		// 	description: "MOCK_DESCRIPTION3",
		// 	likes: 1,
		// 	location: "MOCK_LOCATION3",
		// 	time: 1500609179810,
		// 	uuids: "abc",
		// 	views: 1,
		// 	media: ".jpg"
		// };
		// service.uploadToAWS(".jpg", mock_moment).then(function(moment) {
		// 	console.log("UPLOAD TO AWS");
		// 	console.log(moment);
		// 	expect(core_Mock.upload).toHaveBeenCalled();
		// });
  //   });
});