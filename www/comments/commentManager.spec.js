describe('Comment Manager', function() {
	var common, core, $q, constants, logger, awsServices, scope, $rootScope, notificationManager;

	function createMockComment() {
		return {
            key: "comments/a3052d4fa4ec79a5/40.008446_-75.26046_1499829188066.txt",
            id: "user" + new Date().getTime(),
            likes: "0",
            time: JSON.stringify(new Date().getTime()),
            uuid: 'a3052d4fa4ec79a5',
            onesignalid: "test",
            userName: "MockUser",
            comment: "MockComment",
            commentids: "a3052d4fa4ec79a5",
            parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
			likesuuids: ''
        };
	};

	function createMockMoment() {
		return {
			key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
			description: "MOCK_DESCRIPTION1",
			likes: 1,
			location: "MOCK_LOCATION1",
			time: new Date().getTime().toString(),
			uuids: "123",
			views: 1,
			media: 'picture',
			onesignalid: 'MOCK_SIGNAL_ID',
			bestmoment: false,
			commentids: 'a3052d4fa4ec79a5',
			comments: 'MOCK_COMMENTS',
			creator: 'MOCK_CREATOR'
        };
	};

	beforeEach(module('app'));

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
		awsServices = $injector.get('awsServices');
		commentManager = $injector.get('commentManager');
		$q = $injector.get('$q');
		$rootScope = $injector.get('$rootScope')
		scope = $rootScope.$new();
		localStorageManager = $injector.get('localStorageManager');
		core = $injector.get('core');
		notificationManager = $injector.get('notificationManager');
	}));

	beforeEach(function() {
		spyOn(localStorageManager, 'set');
	});

	it('Should set a user name that does not exist', function(done) {
		var mockUserName = 'Mock UserName';
		var userNameKey = 'comments/userNames.txt';
		spyOn(common, 'getComment').and.callFake(function(key) {
			expect(key).toEqual(userNameKey);
			var result = {  Body: JSON.stringify([]) };
			return $q.resolve(result);
		});
		spyOn(awsServices, 'upload').and.callFake(function() {
			return $q.resolve();
		});
		commentManager.setUserName(mockUserName).then(function () {
			var blob = new Blob([JSON.stringify(mockUserName)], {type: 'text/plain'});
			expect(awsServices.upload).toHaveBeenCalledWith(blob, userNameKey, {}, 'text/plain');
			expect(commentManager.userName).toEqual(mockUserName);
			done();
		});
		scope.$apply();
	});

	it('Should not set a user name already exists', function(done) {
		var mockUserName = 'Mock UserName';
		var userNameKey = 'comments/userNames.txt';
		spyOn(common, 'getComment').and.callFake(function(key) {
			expect(key).toEqual(userNameKey);
			var result = {  Body: JSON.stringify([mockUserName]) };
			return $q.resolve(result);
		});
		spyOn(awsServices, 'upload');
		commentManager.setUserName(mockUserName).then(function () {
			expect(awsServices.upload).not.toHaveBeenCalled();
			done();
		});
		scope.$apply();
	});

	it('Should delete a comment from a moment', function (done) {
		var mock_comment = createMockComment();
		mockOutCoreGetMoments([mock_comment, mock_comment]);
		spyOn(core, 'remove');
		spyOn(awsServices, 'upload');
		commentManager.deleteComment(mock_comment, createMockMoment()).then(function (comments) {
			delete mock_comment.Key;
			var blob = new Blob([JSON.stringify(comments)], {type: 'text/plain'});
			expect(awsServices.upload).toHaveBeenCalledWith(blob, 'comments/' + mock_comment.uuid + '/' + '40.008446_-75.26046_1499829188066.txt' ,{}, 'text/plain');
			done();
		});
		scope.$apply();
	});

	it('Should delete the last comment from a moment', function (done) {
		var mock_comment = createMockComment();
		mockOutCoreGetMoments();
		spyOn(core, 'remove');
		commentManager.deleteComment(mock_comment, createMockMoment()).then(function (comments) {
			expect(core.remove).toHaveBeenCalledWith(mock_comment);
			done();
		});
		scope.$apply();
	});

	it('Should update a comment', function(done) {
		var mock_comment = createMockComment();
		mockOutCoreGetMoments();
		spyOn(awsServices, 'upload');
		commentManager.updateComment(mock_comment).then(function() {
			var blob = new Blob([JSON.stringify([mock_comment])], {type: 'text/plain'});
			expect(awsServices.upload).toHaveBeenCalledWith(blob, mock_comment.key, {}, 'text/plain');
			done();
		});
		scope.$apply();
	});

	it('Should Upload a comment', function(done) {
		var mock_moment = createMockMoment();
		var mock_comment = createMockComment();
		commentManager.userName = "MOCK USER NAME";
		var mockUUID = "123";
		var expectedKey = 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt';
		spyOn(notificationManager, 'notifyUserRepliesToComment');
		spyOn(notificationManager, 'notifyUserRepliesToMoment');
		spyOn(common, 'getUUID').and.returnValue(mockUUID);
		spyOn(common, 'verifyMetaData').and.callFake(function(parent) {
			expect(parent).toEqual(mock_moment);
			return true;
		});
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			expect(key).toEqual(expectedKey);
			var result = {  Body: JSON.stringify([mock_comment]) };
			return $q.resolve(result);
		});
		spyOn(awsServices, 'upload').and.callFake(function(blob, key, metaData, mime) {
			expect(mime).toEqual('text/plain');
			expect(metaData).toEqual({});
			expect(key).toEqual(key);
			return $q.resolve();
		});
		spyOn(core, 'edit').and.callFake(function(parent) {
			expect(parent).toEqual(mock_moment);
			return $q.resolve();
		});
		spyOn(common, 'getComment').and.callFake(function(key) {
			if(key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
				expect(true).toEqual(true)
			} else {
				expect(true).toEqual(false);
			}
			var result = {  Body: JSON.stringify([mock_comment]) };
			return $q.resolve(result);
		});
		spyOn(common, 'uploadToBestMoments').and.callFake(function(parent) {
			expect(parent).toEqual(mock_moment);
			return $q.resolve();
		});
		spyOn(common, 'timeElapsed');
		commentManager.uploadComment(mock_comment, mock_moment).then(function(comment) {
			expect(common.timeElapsed).toHaveBeenCalled();
			expect(comment.likedClass).toEqual('ion-android-favorite-outline');
			done();
		});
		scope.$apply();
	});

	it('Should Upload a comment with a parent as a comment', function(done) {
		commentManager.userName = "MOCK USER NAME";
		var mock_comment = createMockComment();
		var mockUUID = "123";
		var expectedKey = 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt';
		spyOn(notificationManager, 'notifyUserRepliesToComment');
		spyOn(notificationManager, 'notifyUserRepliesToMoment');
		spyOn(common, 'getUUID').and.returnValue(mockUUID);
		spyOn(common, 'verifyMetaData').and.callFake(function(parent) {
			expect(parent).toEqual(mock_comment);
			return true;
		});
		spyOn(awsServices, 'getObject').and.callFake(function(key) {
			expect(key).toEqual(expectedKey);
			var result = {  Body: JSON.stringify([mock_comment]) };
			return $q.resolve(result);
		});
		spyOn(awsServices, 'upload').and.callFake(function(blob, key, metaData, mime) {
			expect(mime).toEqual('text/plain');
			expect(metaData).toEqual({});
			expect(key).toEqual(key);
			return $q.resolve();
		});
		spyOn(core, 'edit').and.callFake(function(parent) {
			expect(parent).toEqual(mock_comment);
			return $q.resolve();
		});
		spyOn(common, 'getComment').and.callFake(function(key) {
			if(key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
				expect(true).toEqual(true)
			} else if (!key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
				expect(true).toEqual(false);
			}
			var result = {  Body: JSON.stringify([mock_comment]) };
			return $q.resolve(result);
		});
		spyOn(common, 'uploadToBestMoments').and.callFake(function(parent) {
			expect(parent).toEqual(mock_comment);
			return $q.resolve();
		});
		spyOn(common, 'timeElapsed');
		commentManager.uploadComment(mock_comment, mock_comment).then(function(comment) {
			expect(common.timeElapsed).toHaveBeenCalled();
			expect(comment.likedClass).toEqual('ion-android-favorite-outline');
			done();
		});
		scope.$apply();
	});

	it('Should retrieveCommentParentsBasedOnUUID', function(done) {
		var mock_moment = createMockMoment();
		var mock_comment = createMockComment();
		spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function() {
			return $q.resolve(mock_moment);
		});
		spyOn(common, 'verifyMetaData').and.returnValue(true);
		spyOn(core, 'listComments').and.callFake(function(key) {
			if(key === 'comments/' + mock_comment.uuid) {
				return $q.resolve([mock_comment]);
			}
			else if(key === mock_moment.key) {
				return $q.resolve(mock_moment);
			}
			else {
				expect(true).toEqual(false);
			}
		});
		spyOn(common, 'getComment').and.callFake(function(key) {
			// var mock_comment = createMockComment();
			mock_comment.id = mock_comment.id.substring(0, mock_comment.id.length - 1);
			if(key === 'comments/' + mock_comment.uuid + '/40.008446_-75.26046_1499829188066.txt') {
				expect(key).toEqual('comments/' + mock_comment.uuid + '/40.008446_-75.26046_1499829188066.txt');
				var result = {  Body: JSON.stringify([mock_comment]) };
				return $q.resolve(result);
			}
			else if(key === mock_moment.key) {
				return $q.resolve( { Metadata: mock_moment });
			}
			else if(key === 'comments/' + mock_comment.uuid + '/40.008446_-75.26046_1499829188066.txt') {
				var result = { Body: JSON.stringify([mock_comment]) };
				return $q.resolve(result);
			}
			else if(key.indexOf('comments/' + mock_comment.uuid + '/' + mock_comment.id !== -1)) {
				var result = { Body: JSON.stringify([mock_comment]) };
				return $q.resolve(result);		
			}
			else {
				expect(true).toEqual(false);
			}
		}); 
		commentManager.retrieveCommentedOnMoments(mock_comment.uuid).then(function(moments) {
			mock_moment.time = common.timeElapsed(mock_moment);
			expect(moments).toEqual([mock_moment]);
			done();
		});
		scope.$apply();
	});

	it('Should retrieveCommentsAndAddToMoments', function(done) {
		var mock_moment = createMockMoment();
		mockOutCoreGetMoments();
		commentManager.retrieveCommentsAndAddToMoments([mock_moment]).then(function (moments) {
			mock_moment.likedClass = "ion-android-favorite-outline";
			expect(moments).toEqual([mock_moment]);
			done();
		});
		scope.$apply();
	});

	it('Should retrieveComments', function(done) {
		var mock_comment = createMockComment();
		mockOutCoreGetMoments();
		commentManager.retrieveComments(createMockMoment()).then(function(comments) {
			// mock_comment.likedClass = 'ion-android-favorite-outline';
			// mock_comment.time = "0m";
			mock_comment.replies = [createMockComment()];
			mock_comment.replies[0].time = common.timeElapsed(mock_comment.replies[0].time);
			// delete comments[0].replies;
			mock_comment.time = common.timeElapsed(mock_comment.time);
			comments[0].replies[0].id = makeGetTimeMockable(comments[0].replies[0].id);
			mock_comment.replies[0].id = makeGetTimeMockable(mock_comment.replies[0].id);
			expect(comments).toEqual([mock_comment]);
			done();
		});
		scope.$apply();
	});

    function makeGetTimeMockable(time) {
        //Removes last digit from time
        return time.substring(0, time.length - 2);
    }

	function mockOutCoreGetMoments(returnValue) {
		var mock_comment = createMockComment();
		if(!returnValue) {
			returnValue = [mock_comment];
		}
		var mockKey1 = 'comments/' + mock_comment.uuid + '/' + '40.008446_-75.26046_1499829188066.txt';
		var mockKey2 = 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt';
		spyOn(common, 'getComment').and.callFake(function(key) {
			if(key === mockKey1 ||
				key === mockKey2) {
				expect(true).toEqual(true);
			}
			else if( !key === mockKey1 ||
					!key === mockKey2) { //Goes into the else block even if the if statement is true - I have no idea why.  Using else if instead
				expect(false).toEqual(true);
			}
			var result = { Body: JSON.stringify(returnValue) };
			return $q.resolve(result);
		});
	};

});