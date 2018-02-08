describe('myMoment Service', function() {
    var common, downloadManager, localStorageManager, core, geolocation, service, $q, $httpBackend, constants, $scope, $templateCache, cordovaGeolocation, awsServices, commentManager;
    beforeEach(module('app'));
    var mockLat = 40.008446;
    var mockLng = -75.260460;
    var mock_pos_coords = {
        coords: {
            latitude: mockLat,
            longitude: mockLng
        }
    };
    var mock_http_response = {
        data: {
            results: ['', '', {formatted_address: "Narberth, PA"}]
        }
    };
    var mock_moment;
    var mock_comment;

    beforeEach(inject(function($templateCache) {
        $templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
        $templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
        $templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
        $templateCache.put('moments/moments.html', 'layout/tabsController.html');
        $templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
        $templateCache.put('templates/page.html', 'layout/tabsController.html');
    }));

    beforeEach(inject(function($injector) {
    	common = $injector.get('common');
        constants = $injector.get('constants'); 
        $q = $injector.get('$q');
        $scope = $injector.get('$rootScope').$new();
        service = $injector.get('myMomentsService');
        cordovaGeolocation = $injector.get('$cordovaGeolocation');
        geolocation = $injector.get('geolocation');
        $http = $injector.get('$http');
        awsServices = $injector.get('awsServices');
        core = $injector.get('core');
        localStorageManager = $injector.get('localStorageManager');
        downloadManager = $injector.get('downloadManager');
        commentManager = $injector.get('commentManager');

        constants.DEV_MODE = false;
    }));

    function createSpy() {
        spyOn(downloadManager, 'downloadFiles').and.callFake(function() {
            return $q.resolve();
        });

        spyOn($http, 'get').and.callFake(function(url) {
            return $q.resolve(mock_http_response);
        });

        spyOn(awsServices, 'multiPartUpload').and.callFake(function() {
            return $q.resolve();
        });

        spyOn(awsServices, 'upload').and.callFake(function() {
            return $q.resolve('test');
        });

        spyOn(awsServices, 'getObject').and.callFake(function() {
            var result = { Body: JSON.stringify([createMockComment()]) };
            return $q.resolve(result);
        });

        spyOn(common, 'getUUID').and.callFake(function() {
            return Math.random();
        });
    };

    function createMockComment() {
        return {
            key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
            id: "user" + new Date().getTime(),
            likes: "0",
            time: JSON.stringify(new Date().getTime()),
            uuid: 'a3052d4fa4ec79a5',
            oneSignalid: "test",
            userName: "MockUser",
            comment: "MockComment",
            commentids: "a3052d4fa4ec79a5",
            parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
            replies: [],
            nativeurl: "MOCKURL"
        };
    };

    function createMockMoment() {
        return {
            key: "https://s3.amazonaws.com/mng-moment/moment/PA/40.008446_-75.26046_1499829188066.jpg",
            description: "MOCK_DESCRIPTION",
            likes: '1000',
            location: "MOCK_LOCATION",
            time: new Date().getTime(),
            uuids: "1",
            views: '1000',
            onesignalid: "test",
            gainedLikes: 0,
            bestmoment: false,
            commentids: 'a3052d4fa4ec79a5',
        };
    };

    beforeEach(inject(function() {
        createSpy();
        geolocation.max_north = {lat: 99999};
        geolocation.max_west = {lng: -99999};
        geolocation.max_east = {lng: 99999};
        geolocation.max_south = {lat: -99999};
    }));

    it('Should initialize the moments', function(done) {
        service.momentArray = createMockMoment();
        spyOn(localStorage, 'getItem').and.callFake(function() {
            return JSON.stringify([createMockMoment()]);
        });

        spyOn(awsServices, 'getMomentMetaData').and.callFake(function() {
            return $q.resolve( { Metadata: createMockMoment() });
        });
        spyOn(core, 'getMoment').and.callFake(function(key) {
            var expectedKey = 'comments/' + 'a3052d4fa4ec79a5' + '/' + "40.008446_-75.26046_1499829188066.txt";
            if(key === 'comments/' + 'a3052d4fa4ec79a5' + '/' + "40.008446_-75.26046_1499829188066.txt" ||
                key === 'comments/' + 'a3052d4fa4ec79a5/' + createMockComment().id + '.txt') {
                expect(true).toEqual(true);
            } else {
                expect(true).toEqual(false);
            }
            var result = {  Body: JSON.stringify([createMockComment()]) };
            return $q.resolve(result);
        });
        service.initialize().then(function(moment) {
            var mockMoment = createMockMoment();
            mockMoment.shortDescription = "MOCK_DESCRIPTION";
            mockMoment.comments = [createMockComment()];
            expect(moment[0].time).toContain('d');
            delete moment[0].time;
            delete mockMoment.time;
            expect(moment[0].comments[0].time).toContain('m');
            delete moment[0].comments[0].time;
            delete mockMoment.comments[0].time;
            mockMoment.comments[0].replies = [createMockComment()];
            mockMoment.comments[0].replies[0].time = common.timeElapsed(mockMoment.comments[0].replies[0].time);
            mockMoment.comments[0].id = makeGetTimeMockable(moment[0].comments[0].id);
            moment[0].comments[0].id = makeGetTimeMockable(moment[0].comments[0].id);
            mockMoment.comments[0].replies[0].id = makeGetTimeMockable(mockMoment.comments[0].replies[0].id);
            moment[0].comments[0].replies[0].id = makeGetTimeMockable(moment[0].comments[0].replies[0].id);
        	
            expect(moment[0]).toEqual(mockMoment);
            expect(service.getTotalLikes()).toEqual(parseInt(mockMoment.likes));
            expect(service.getExtraLikes()).toEqual(0);
            done();
        });
        $scope.$apply();
    });

    function makeGetTimeMockable(time) {
        //Removes last digit from time
        return time.substring(0, time.length - 2);
    }

});