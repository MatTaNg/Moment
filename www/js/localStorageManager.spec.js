describe('Submit Moment', function() {

	var downloadManager, localStorageManager, $q, $scope, $templateCache;

	beforeEach(module('app'));

	beforeEach(inject(function($templateCache) {
    	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
    	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
    	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
    	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
    	$templateCache.put('submitMoment/submitMoment.html', 'layout/submitMoment.html');
    	$templateCache.put('templates/page.html', 'templates/page.html');
	}));

    beforeEach(inject(function($injector) {
    	localStorageManager = $injector.get('localStorageManager');
        $q = $injector.get('$q');
        $scope = $injector.get('$rootScope').$new();
        downloadManager = $injector.get('downloadManager');

        localStorage.clear();
    }));

    function getLocalStorage(storage) {
    	return JSON.parse(localStorage.getItem(storage));
    }

	it('Should create an empty local storage if it DNE', function() {
		expect(localStorageManager.get('moments')).toEqual([]);
		expect(localStorageManager.get('bestMoments')).toEqual([]);
		expect(localStorageManager.get('myMoments')).toEqual([]);
	});

	it('Should retrieve a local storage', function() {
		localStorage.setItem('moments', JSON.stringify(['Mock']));
		localStorage.setItem('myMoments', JSON.stringify(['Mock']));
		localStorage.setItem('bestMoments', JSON.stringify(['Mock']));

		expect(localStorageManager.get('moments')).toEqual(['Mock']);
		expect(localStorageManager.get('myMoments')).toEqual(['Mock']);
		expect(localStorageManager.get('bestMoments')).toEqual(['Mock']);
	});

	it('Should set a local storage', function(done) {
		spyOn(downloadManager, 'downloadFiles').and.callFake(function(items) {
			expect(items).toEqual(['Mock']);
			return $q.resolve(['Mock']);
		});
		localStorageManager.set('timeSinceLastMoment', "1m");
		expect(localStorage.getItem('timeSinceLastMoment')).toEqual('1m');

		localStorageManager.set('moments', ['Mock']).then(function(items) {
			expect(getLocalStorage('moments')).toEqual(['Mock']);
			localStorageManager.set('myMoments', ['Mock']).then(function(items) {
				expect(getLocalStorage('myMoments')).toEqual(['Mock']);
				localStorageManager.set('bestMoments', ['Mock']).then(function(items) {
					expect(getLocalStorage('bestMoments')).toEqual(['Mock']);
					done();
				});
			});
		});
		$scope.$apply();
	});

	it('Should add and download', function(done) {
		spyOn(downloadManager, 'downloadFiles').and.callFake(function(items) {
			expect(items).toEqual(['Mock']);
			return $q.resolve(['Mock']);
		});
		spyOn(localStorageManager, 'get').and.returnValue(['Mock']);
		localStorageManager.addandDownload('moments', ['Mock']).then(function(items) {
			expect(getLocalStorage('moments')).toEqual(['Mock']);
			localStorageManager.addandDownload('myMoments', ['Mock']).then(function(items) {
				expect(getLocalStorage('myMoments')).toEqual(['Mock']);
				localStorageManager.addandDownload('bestMoments', ['Mock']).then(function(items) {
					expect(getLocalStorage('bestMoments')).toEqual(['Mock']);
					done();
				});
			});
		});
		$scope.$apply();
	});

	it('Should remove from local storage', function() {
		spyOn(localStorageManager, 'get').and.callFake(function() {
			return ['Mock']
		});

		localStorage.setItem('moment', ['Mock']);
		localStorage.setItem('myMoment', ['Mock']);
		localStorage.setItem('bestMoment', ['Mock']);

		localStorageManager.remove('moment', 'Mock');
		expect(JSON.parse(localStorage.getItem('moment'))).toEqual([]);
		localStorageManager.remove('myMoment', 'Mock');
		expect(JSON.parse(localStorage.getItem('myMoment'))).toEqual([]);
		localStorageManager.remove('bestMoment', 'Mock');
		expect(JSON.parse(localStorage.getItem('bestMoment'))).toEqual([]);
	});
});