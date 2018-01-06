describe('Submit Moment', function() {

	var downloadManager, localStorageManager, $q, $scope, $templateCache;
	var mock_moment;

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

        mock_moment = [{
			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: 1500609179810,
			uuids: "123",
			views: 1,
			media: ".mp4"
		}];

        localStorage.clear();
    }));

    function getLocalStorage(storage) {
    	try {
    		return JSON.parse(localStorage.getItem(storage));
    	} catch(e) {
    		return localStorage.getItem(storage);
    	}
    }

	it('Should create an empty local storage if it DNE', function() {
		expect(localStorageManager.get('moments')).toEqual([]);
		expect(localStorageManager.get('bestMoments')).toEqual([]);
		expect(localStorageManager.get('myMoments')).toEqual([]);
	});

	it('Should retrieve a local storage', function() {
		localStorage.setItem('moments', JSON.stringify(mock_moment));
		localStorage.setItem('myMoments', JSON.stringify(mock_moment));
		localStorage.setItem('bestMoments', JSON.stringify(mock_moment));

		expect(localStorageManager.get('moments')).toEqual(mock_moment);
		expect(localStorageManager.get('myMoments')).toEqual(mock_moment);
		expect(localStorageManager.get('bestMoments')).toEqual(mock_moment);
	});

	it('Should set a local storage', function(done) {
		spyOn(downloadManager, 'downloadFiles').and.callFake(function(items) {
			expect(items).toEqual(mock_moment);
			return $q.resolve(mock_moment);
		});

		localStorageManager.set('moments', mock_moment).then(function(items) {
			expect(getLocalStorage('moments')).toEqual(mock_moment);
			localStorageManager.set('myMoments', mock_moment).then(function(items) {
				expect(getLocalStorage('myMoments')).toEqual(mock_moment);
			});
		}).then(function() {
			localStorageManager.set('bestMoments', mock_moment).then(function(items) {
				expect(getLocalStorage('bestMoments')).toEqual(mock_moment);
				done();
			});;
		})			
		$scope.$apply();
	});

	it('Should set a local storage with a non-Array object', function(done) {
		localStorageManager.set('timeSinceLastMoment', "1m").then(function() {
			expect(localStorage.getItem('timeSinceLastMoment')).toEqual('1m');
			done();
		});
		$scope.$apply();
	});

	it('Should set a local storage with an Array, non-Moment object', function(done) {

		localStorageManager.set('timeSinceLastMoment', "1m").then(function() {
			expect(localStorage.getItem('timeSinceLastMoment')).toEqual('1m');
			done();
		});
		$scope.$apply();
	});

	it('Should add and download', function(done) {
		spyOn(downloadManager, 'downloadFiles').and.callFake(function(items) {
			expect(items).toEqual(mock_moment);
			return $q.resolve(mock_moment);
		});
		spyOn(localStorageManager, 'get').and.returnValue(mock_moment);
		localStorageManager.addandDownload('moments', mock_moment).then(function(items) {
			expect(getLocalStorage('moments')).toEqual(mock_moment);
			localStorageManager.addandDownload('myMoments', mock_moment).then(function(items) {
				expect(getLocalStorage('myMoments')).toEqual(mock_moment);
			});
		}).then(function() {
			localStorageManager.addandDownload('bestMoments', mock_moment).then(function(items) {
				expect(getLocalStorage('bestMoments')).toEqual(mock_moment);
				done();
			});
		});
		$scope.$apply();
	});

	it('Should remove from local storage', function() {
		spyOn(localStorageManager, 'get').and.callFake(function() {
			return mock_moment;
		});
		localStorage.setItem('moment', mock_moment);
		localStorageManager.remove('moment', mock_moment[0]);
		expect(JSON.parse(localStorage.getItem('moment'))).toEqual([]);
	});
});