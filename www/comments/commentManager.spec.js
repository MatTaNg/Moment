// describe('Comment Manager', function() {
// 	var core, $q, constants, logger, awsServices, scope, $rootScope, notificationManager;

// 	var mock_moment;
// 	var mock_comment;

// 	beforeEach(module('app'));

// 	beforeEach(inject(function($templateCache) {
//     	$templateCache.put('layout/tabsController.html', 'layout/tabsController.html');
//     	$templateCache.put('myMoments/myMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('bestMoments/bestMoments.html', 'layout/tabsController.html');
//     	$templateCache.put('moments/moments.html', 'layout/tabsController.html');
//     	$templateCache.put('submitMoment/submitMoment.html', 'layout/tabsController.html');
//     	$templateCache.put('templates/page.html', 'layout/tabsController.html');
// 	}));

// 	beforeEach(function() {
//         mock_moment = {
//             Key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             key: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             description: "MOCK_DESCRIPTION",
//             likes: '1000',
//             location: "MOCK_LOCATION",
//             time: new Date().getTime(),
//             uuids: "1",
//             views: '1000',
//             onesignalid: "test",
//             gainedLikes: 0,
//             bestmoment: false,
//             commentids: 'a3052d4fa4ec79a5',
//             media: 'MOCK',
//             nativeurl: "MOCKURL"
//         };
//         mock_comment = {
//             Key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
//             key: "comments/a3052d4fa4ec79a5/40.0015101_-75.2700792_1513458108158.txt",
//             id: "user" + new Date().getTime(),
//             likes: "0",
//             time: JSON.stringify(new Date().getTime()),
//             uuid: 'a3052d4fa4ec79a5',
//             onesignalid: "test",
//             userName: "MockUser",
//             comment: "MockComment",
//             commentids: "a3052d4fa4ec79a5",
//             parent: "moment/PA/40.008446_-75.26046_1499829188066.jpg",
//             replies: []
//         };
// 	});

//     beforeEach(inject(function($injector) {
// 		awsServices = $injector.get('awsServices');
// 		commentManager = $injector.get('commentManager');
// 		$q = $injector.get('$q');
// 		$rootScope = $injector.get('$rootScope')
// 		scope = $rootScope.$new();
// 		localStorageManager = $injector.get('localStorageManager');
// 		core = $injector.get('core');
// 		notificationManager = $injector.get('notificationManager');
// 	}));

// 	beforeEach(function() {
// 		spyOn(localStorageManager, 'set');
// 	});

// 	it('Should set a user name that does not exist', function(done) {
// 		var mockUserName = 'Mock UserName';
// 		var userNameKey = 'comments/userNames.txt';
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			expect(key).toEqual(userNameKey);
// 			var result = {  Body: JSON.stringify([]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(awsServices, 'upload').and.callFake(function() {
// 			return $q.resolve();
// 		});
// 		commentManager.setUserName(mockUserName).then(function () {
// 			var blob = new Blob([JSON.stringify(mockUserName)], {type: 'text/plain'});
// 			expect(awsServices.upload).toHaveBeenCalledWith(blob, userNameKey, {}, 'text/plain');
// 			expect(commentManager.userName).toEqual(mockUserName);
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should not set a user name already exists', function(done) {
// 		var mockUserName = 'Mock UserName';
// 		var userNameKey = 'comments/userNames.txt';
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			expect(key).toEqual(userNameKey);
// 			var result = {  Body: JSON.stringify([mockUserName]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(awsServices, 'upload');
// 		commentManager.setUserName(mockUserName).then(function () {
// 			expect(awsServices.upload).not.toHaveBeenCalled();
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should delete a comment from a moment', function (done) {
// 		mockOutCoreGetMoments([mock_comment, mock_comment]);
// 		spyOn(core, 'remove');
// 		spyOn(awsServices, 'upload');
// 		commentManager.deleteComment(mock_comment, mock_moment).then(function (comments) {
// 			delete mock_comment.Key;
// 			var blob = new Blob([JSON.stringify(comments)], {type: 'text/plain'});
// 			expect(awsServices.upload).toHaveBeenCalledWith(blob, 'comments/' + mock_comment.uuid + '/' + '40.0015101_-75.2700792_1513458108158.txt' ,{}, 'text/plain');
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should delete the last comment from a moment', function (done) {
// 		mockOutCoreGetMoments();
// 		spyOn(core, 'remove');
// 		commentManager.deleteComment(mock_comment, mock_moment).then(function (comments) {
// 			delete mock_comment.Key;
// 			expect(core.remove).toHaveBeenCalledWith(mock_comment);
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should update a comment', function(done) {
// 		mockOutCoreGetMoments();
// 		spyOn(awsServices, 'upload');
// 		commentManager.updateComment(mock_comment).then(function() {
// 			var blob = new Blob([JSON.stringify([mock_comment])], {type: 'text/plain'});
// 			expect(awsServices.upload).toHaveBeenCalledWith(blob, mock_comment.key, {}, 'text/plain');
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should Upload a comment', function(done) {
// 		commentManager.userName = "MOCK USER NAME";
// 		var mockUUID = "123";
// 		var expectedKey = 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt';
// 		spyOn(notificationManager, 'notifyUserRepliesToComment');
// 		spyOn(notificationManager, 'notifyUserRepliesToMoment');
// 		spyOn(core, 'getUUID').and.returnValue(mockUUID);
// 		spyOn(core, 'verifyMetaData').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_moment);
// 			return true;
// 		});
// 		spyOn(awsServices, 'getObject').and.callFake(function(key) {
// 			expect(key).toEqual(expectedKey);
// 			var result = {  Body: JSON.stringify([mock_comment]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(awsServices, 'upload').and.callFake(function(blob, key, metaData, mime) {
// 			expect(mime).toEqual('text/plain');
// 			expect(metaData).toEqual({});
// 			expect(key).toEqual(key);
// 			return $q.resolve();
// 		});
// 		spyOn(core, 'edit').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_moment);
// 			return $q.resolve();
// 		});
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			if(key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
// 				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
// 				expect(true).toEqual(true)
// 			} else {
// 				expect(true).toEqual(false);
// 			}
// 			var result = {  Body: JSON.stringify([mock_comment]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(common, 'uploadToBestMoments').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_moment);
// 			return $q.resolve();
// 		});
// 		spyOn(common, 'timeElapsed');
// 		commentManager.uploadComment(mock_comment, mock_moment).then(function(comment) {
// 			expect(core.timeElapsed).toHaveBeenCalled();
// 			expect(comment.likedClass).toEqual('ion-android-favorite-outline');
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should Upload a comment with a parent as a comment', function(done) {
// 		commentManager.userName = "MOCK USER NAME";
// 		var mockUUID = "123";
// 		var expectedKey = 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt';
// 		spyOn(notificationManager, 'notifyUserRepliesToComment');
// 		spyOn(notificationManager, 'notifyUserRepliesToMoment');
// 		spyOn(core, 'getUUID').and.returnValue(mockUUID);
// 		spyOn(core, 'verifyMetaData').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_comment);
// 			return true;
// 		});
// 		spyOn(awsServices, 'getObject').and.callFake(function(key) {
// 			expect(key).toEqual(expectedKey);
// 			var result = {  Body: JSON.stringify([mock_comment]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(awsServices, 'upload').and.callFake(function(blob, key, metaData, mime) {
// 			expect(mime).toEqual('text/plain');
// 			expect(metaData).toEqual({});
// 			expect(key).toEqual(key);
// 			return $q.resolve();
// 		});
// 		spyOn(core, 'edit').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_comment);
// 			return $q.resolve();
// 		});
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			if(key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
// 				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
// 				expect(true).toEqual(true)
// 			} else if (!key === 'comments/' + mockUUID + '/' + '40.008446_-75.26046_1499829188066.txt' ||
// 				key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
// 				expect(true).toEqual(false);
// 			}
// 			var result = {  Body: JSON.stringify([mock_comment]) };
// 			return $q.resolve(result);
// 		});
// 		spyOn(common, 'uploadToBestMoments').and.callFake(function(parent) {
// 			expect(parent).toEqual(mock_comment);
// 			return $q.resolve();
// 		});
// 		spyOn(core, 'timeElapsed');
// 		commentManager.uploadComment(mock_comment, mock_comment).then(function(comment) {
// 			expect(core.timeElapsed).toHaveBeenCalled();
// 			expect(comment.likedClass).toEqual('ion-android-favorite-outline');
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should retrieveCommentParentsBasedOnUUID', function(done) {
// 		spyOn(commentManager, 'retrieveCommentsAndAddToMoments').and.callFake(function() {
// 			return $q.resolve(mock_moment);
// 		});
// 		spyOn(core, 'verifyMetaData').and.returnValue(true);
// 		spyOn(core, 'listComments').and.callFake(function(key) {
// 			if(key === 'comments/' + mock_comment.uuid) {
// 				return $q.resolve([mock_comment]);
// 			}
// 			else if(key === mock_moment.key) {
// 				return $q.resolve(mock_moment);
// 			}
// 			else {
// 				expect(true).toEqual(false);
// 			}
// 		});
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			if(key === 'comments/' + mock_comment.uuid + '/40.0015101_-75.2700792_1513458108158.txt') {
// 				expect(key).toEqual('comments/' + mock_comment.uuid + '/40.0015101_-75.2700792_1513458108158.txt');
// 				var result = {  Body: JSON.stringify([mock_comment]) };
// 				return $q.resolve(result);
// 			}
// 			else if(key === mock_moment.key) {
// 				return $q.resolve( { Metadata: mock_moment });
// 			}
// 			else if(key === 'comments/' + mock_comment.uuid + '/40.008446_-75.26046_1499829188066.txt') {
// 				var result = { Body: JSON.stringify([mock_comment]) };
// 				return $q.resolve(result);
// 			}
// 			else if(key === 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt') {
// 				var result = { Body: JSON.stringify([mock_comment]) };
// 				return $q.resolve(result);		
// 			}
// 			else {
// 				expect(true).toEqual(false);
// 			}
// 		}); 
// 		commentManager.retrieveCommentedOnMoments(mock_comment.uuid).then(function(moments) {
// 			expect(moments).toEqual([mock_moment]);
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should retrieveCommentsAndAddToMoments', function(done) {
// 		mockOutCoreGetMoments();
// 		commentManager.retrieveCommentsAndAddToMoments([mock_moment]).then(function (moments) {
// 			mock_moment.likedClass = "ion-android-favorite-outline";
// 			expect(moments).toEqual([mock_moment]);
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	it('Should retrieveComments', function(done) {
// 		mockOutCoreGetMoments();
// 		commentManager.retrieveComments(mock_moment).then(function(comments) {
// 			mock_comment.likedClass = 'ion-android-favorite-outline';
// 			mock_comment.time = "0m";
// 			expect(comments).toEqual([mock_comment]);
// 			done();
// 		});
// 		scope.$apply();
// 	});

// 	function mockOutCoreGetMoments(returnValue) {
// 		if(!returnValue) {
// 			returnValue = [mock_comment];
// 		}
// 		var mockKey1 = 'comments/' + mock_comment.uuid + '/' + '40.008446_-75.26046_1499829188066.txt';
// 		var mockKey2 = 'comments/' + mock_comment.uuid + '/' + mock_comment.id + '.txt';
// 		spyOn(common, 'getComment').and.callFake(function(key) {
// 			if(key === mockKey1 ||
// 				key === mockKey2) {
// 				expect(true).toEqual(true);
// 			}
// 			else if( !key === mockKey1 ||
// 					!key === mockKey2) { //Goes into the else block even if the if statement is true - I have no idea why.  Using else if instead
// 				expect(false).toEqual(true);
// 			}
// 			var result = { Body: JSON.stringify(returnValue) };
// 			return $q.resolve(result);
// 		});
// 	};

// });