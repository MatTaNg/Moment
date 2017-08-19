// describe("AWS Service", function() {
// 	var awsService, $q, constants, $scope, $templateCache;

// 	beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
// 	}));

//     beforeEach(inject(function($injector) {
    	
//         $q = $injector.get('$q');

//         constants = $injector.get('constants');
//         $scope = $injector.get('$rootScope').$new();
//         awsService = $injector.get('aws_services');
        
//     }));

// 	it("Should upload to AWS", function() {
// 		spyOn()
// 		aws_services.upload('file', 'key', 'metaData').then(function() {

// 		});
// 	});
// });