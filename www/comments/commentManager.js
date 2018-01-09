 (function() {
 	angular.module('commentManager', [])

 	.service('commentManager', ['common', 'awsServices', 'core', 'notificationManager', 'logger', 'localStorageManager', '$q', 'constants', commentManager]);

 	function commentManager(common, awsServices, core, notificationManager, logger, localStorageManager, $q, constants){
 		var vm = this;

 		vm.uploadComment = uploadComment,
 		vm.retrieveComments = retrieveComments,
 		vm.updateComment = updateComment,
 		vm.deleteComment = deleteComment;
 		vm.getUserName = getUserName;
 		vm.setUserName = setUserName;
 		vm.retrieveCommentedOnMoments = retrieveCommentedOnMoments;
 		vm.retrieveCommentsAndAddToMoments = retrieveCommentsAndAddToMoments;
 		vm.sendNotification = sendNotification;

 		vm.userName = "user";

 		function removeExcessiveProperties(comment) {
 			var result = {};
			result.key = comment.key;
			result.id = comment.id;
			result.likes = comment.likes;
			result.time = common.convertTimeToMiliSeconds(comment.time);
			result.uuid = comment.uuid;
			result.onesignalid = comment.onesignalid;
			result.userName = comment.userName;
			result.comment = comment.comment;
			result.commentids = comment.commentids;
			result.parent = comment.parent;
			result.likesuuids = comment.likesuuids;
			// result.replies = comment.replies;
			return result;
 		};

 		function getUserName() {
 			return vm.userName;
 		};

 		function setUserName(userName) {
 			var deferred = $q.defer();
 			var userNameKey = 'comments/userNames.txt';
			return common.getComment(userNameKey).then(function (userNames) {
				if(userNames !== 'Not Found') {
					var userNames = JSON.parse(userNames.Body.toString('ascii'));
					for(var i = 0; i < userNames.length; i++) {
						if(userNames[i] === userName) {
							// deferred.reject("user name taken");
							return "User name taken";
						}
					}
					userNames.push(userName);
					var blob = new Blob([JSON.stringify(userNames)], {type: 'text/plain'});
					return awsServices.upload(blob, userNameKey, {}, 'text/plain').then(function() {
						vm.userName = userName;
						localStorageManager.set('userName', vm.userName);
						// deferred.resolve();
					});
				} 
				else {
					return [];
				}
			}, function(error) {
				var parameters = { userName: userName };
				logger.logFile("commentManager.setUserName", parameters, error, 'error.txt');
				return error;
			});
			// return deferred.promise;
 		};

 		function deleteComment(comment, parent) {
 			comment = removeExcessiveProperties(comment);
			return getComments(comment.key).then(function (comments) {
				for(var i = 0; i < comments.length; i++) {
					if(comments[i].id === comment.id) {
						comments.splice(i, 1);
					}
				}
				if(comments.length === 0) {
					return core.remove(comment);
				}
				else {
					return createBlobAndUpload(comments, comment.key);
				}
			});
 		};

 		function updateComment(comment) {
 			comment = removeExcessiveProperties(comment);
			return getComments(comment.key).then(function (comments) {
				for(var i = 0; i < comments.length; i++) {
					if(comments[i].id === comment.id) {
						comments[i] = comment;
					}
				}
				createBlobAndUpload(comments, comment.key);
			});
 		};

 		function uploadComment(comment, parent) {
 			var uuid = common.getUUID();
 			var uploadKey = 'comments/' + uuid + '/' + parent.id + '.txt';
 			if(common.verifyMetaData(parent)) {
				uploadKey = 'comments/' + uuid + '/' + extractKeyFromMoment(parent.key) + '.txt';
			}
			return getComments(uploadKey).then(function (comments) {
				var commentObj = {
					key: uploadKey,
					id: vm.userName + new Date().getTime(),
					likes: "0",
					time: JSON.stringify(new Date().getTime()),
					uuid: common.getUUID(),
					onesignalid: JSON.stringify(notificationManager.getPlayerId()),
					userName: vm.userName,
					comment: comment,
					commentids: '',
					parent: common.splitUrlOff(parent.key),
					likesuuids: '',
					replies: []
				};
				comments.push(commentObj);
				return createBlobAndUpload(comments, uploadKey).then(function() {
					updateParentObject(parent);
					sendNotification(parent);
					commentObj.time = common.timeElapsed(commentObj.time);
	 				commentObj.likedClass = commentObj.likedClass = "ion-android-favorite-outline";
					return commentObj;
				});
			});
 		};

 		function sendNotification(parent) {
 			if(common.verifyMetaData(parent)) {
 				notificationManager.notifyUserRepliesToMoment(parent.onesignalid);
 			}
 			else {
				notificationManager.notifyUserRepliesToComment(parent.onesignalid);
			}
 		};

 		function extractKeyFromMoment(key) {
 			var resultKey = common.splitUrlOff(key).split('/');
 			var state = resultKey[resultKey.length - 2];
 			resultKey = resultKey[resultKey.length - 1];
 			resultKey = resultKey.substring(0, resultKey.length - 4);
			return resultKey;
 		};

 		function updateParentObject(parent) {
 			if(!(parent.commentids.includes(common.getUUID()))) {
				parent.commentids = parent.commentids + " " + common.getUUID();
				if(common.verifyMetaData(parent)) {
					parent.commentids = parent.commentids.trim();
					parent.comments = JSON.stringify(parent.comments); 
					core.edit(parent).then(function() {
						return common.uploadToBestMoments(parent);
					});
				}
				else {
					getComments(parent.key).then(function (comments) {
						comments.splice(comments.indexOf(parent), 1);
						comments.push(parent);
						return createBlobAndUpload(comments, parent.key);
					});
					
				}
 			}
 		};

 		function retrieveCommentParentsBasedOnUUID(uuid) {
 			var deferred = $q.defer();
 			var key = 'comments/' + uuid;
 			var result = [];
 			core.listComments(key).then(function(comments) {
 				async.each(comments, function(commentObj, callback) {
 					common.getComment(commentObj.Key).then(function(comment) {
 						if(comment !== 'Not Found') {
 							result.push(JSON.parse(comment.Body.toString('ascii'))[0]);
	 						// if(result.length === 0) {
	 						// 	result = JSON.parse(comment.Body.toString('ascii'));
	 						// } else {
	 						// 	result.concat(JSON.parse(comment.Body.toString('ascii'))); 							
	 						// }
	 					}
 						callback();
 					});
 				}, function(error) {
 					if(error) {
						var params = { uuid : uuid};
						logger.logFile("commentManager.retrieveCommentParentsBasedOnUUID", param, error, "errors.txt");
						deferred.reject(error);
 					}
 					deferred.resolve(result);
 				});
 			});
 			return deferred.promise;
 		};

 		function doesArrayContainObj(array, obj) {
 			for(var i = 0; i < array.length; i++) {
 				if(JSON.stringify(array[i]) === JSON.stringify(obj)) {
 					return true;
 				}
 			}
 			return false;
 		};

 		function retrieveMomentsBasedOnComments(comments) {
 			var deferred = $q.defer();
 			var moments = [];
 			async.each(comments, function(comment, callback) {
 				common.getComment(comment.parent).then(function(momentORcomment) {
 					if(momentORcomment !== "Not Found") {
	 					momentORcomment = momentORcomment;
	 					if(common.verifyMetaData(momentORcomment.Metadata) && doesArrayContainObj(moments, momentORcomment) === false) {
	 						moments.push(momentORcomment.Metadata);	
	 					}
	 				}
 					callback();
 				});
 			}, function(error) {
 				if(error) {
					var params = { comments : comments};
					logger.logFile("commentManager.retrieveMomentsBasedOnComments", param, error, "errors.txt");
					deferred.reject(error);
	 			}
	 			retrieveCommentsAndAddToMoments(moments).then(function(moments) {
	 				deferred.resolve(moments);
	 			});
 			});
 			return deferred.promise;
 		};

 		function retrieveCommentedOnMoments(uuid) {
 			return retrieveCommentParentsBasedOnUUID(uuid).then(function (comments) {
 				return retrieveMomentsBasedOnComments(comments);
 			});
 		};

 		function retrieveCommentsAndAddToMoments(moments) {
 			var deferred = $q.defer();
 			var result = [];
 			async.each(moments, function (moment, callback) {
				retrieveComments(moment).then(function(comments) {
					moment.time = common.timeElapsed(moment.time);
					moment.comments = comments;
					result.push(moment);
					callback(null);
				});
 			}, function (error, results) {
 				if(error) {
 					var parameters = { moments: moments}
 					logger.logFile("commentManager.retrieveCommentsAndAddToMoments", parameters, error, 'error.txt');
 					deferred.reject(error);
 				}
 				deferred.resolve(result);
 			});
 			return deferred.promise;
 		};

 		function retrieveComments(moment) {
 			var deferred = $q.defer();
 			var commentIds = moment.commentids.split(" ");
 			var result = [];
 			var key = '';
 			var commentArray = [];
 			var comment = "";
 			async.each(commentIds, function (commentId, callback) {
 				key =  "comments/" + commentId + '/' + extractKeyFromMoment(moment.key) + '.txt';
				getComments(key).then(function (comments) {
					commentArray = commentArray.concat(comments);
					callback(null);
	 			}, function (error) {
	 				callback(null);
	 			});
 			}, function (error, results) {
 				if(error) {
 					var parameters = { moment: moment};
 					logger.logFile("commentManager.retrieveComments", parameters, error, 'error.txt');
 					deferred.reject();
 				}
 				commentArray = convertTime(commentArray);
 				deferred.resolve(commentArray);
 			});
 			return deferred.promise;
 		};

 		function createBlobAndUpload(comments, key) {
			var blob = new Blob([JSON.stringify(comments)], {type: 'text/plain'});
			return awsServices.upload(blob, key, {}, 'text/plain');
 		};

 		function getComments(commentKey) {
			return common.getComment(commentKey).then(function (comments) {
				if(comments !== 'Not Found') {
					comments = JSON.parse(comments.Body.toString('ascii'));
 					comments = addClasses(comments);	
					return getReplies(comments);
				} 
				else {
					return [];
				}
			});
 		};

 		function getReplies(comments) {
 			var deferred = $q.defer();
 			async.each(comments, function(comment, callback) {
 				var index = comments.indexOf(comment);
 				comment = removeExcessiveProperties(comment);
 				comment.replies = [];
 				getReply(comment).then(function(replies) {
 					comment.replies = replies;
 					comments[index].replies = replies;
 					callback(null);
 				});
 			}, function (error) {
 				if(error) {
 					var parameters = {comments : comments};
 					logger.logFile("commentManager.getReplies", parameters, error, 'error.txt');
 					deferred.reject(error)
 				}
 				deferred.resolve(comments);
 			});
 			return deferred.promise;
 		};

 		function getReply(comment) {
 			var deferred = $q.defer();
 			var ids = comment.commentids.split(" ");
 			var key = '';
 			var allReplies = [];
 			async.each(ids, function(id, callback) {
 				key = 'comments/' + id + '/' + comment.id + '.txt';
 				common.getComment(key).then(function (comments) {
 					if(comments !== "Not Found") {
	 					comments = JSON.parse(comments.Body.toString('ascii'));
	 					comments = convertTime(comments);
	 					comments = addClasses(comments);
	 					allReplies = comments;
 					}
					callback(null);
 				});
 			}, function (error) {
 				if(error) {
 					var parameters = { comment: comment};
 					logger.logFile("commentManager.getReply", parameters, error, 'error.txt');
 					deferred.reject(error);
 				}
 				deferred.resolve(allReplies);
 			});
 			return deferred.promise;
 		};

 		function convertTime(comments) {
 			// comments = [].concat(comments || []);
			for(var i = 0; i < comments.length; i++) {
				comments[i].time = common.timeElapsed(comments[i].time);
			}
			return comments;
 		};

 		function addClasses(comments) {
 			var likesUUID;
 			// comments = [].concat(comments || []);
			for(var i = 0; i < comments.length; i++) {
				likesUUID = comments[i].likesuuids.split(' ');
				if(likesUUID.includes(common.getUUID())) {
					comments[i].likedClass = "ion-android-favorite";					
				}
				else {
					comments[i].likedClass = "ion-android-favorite-outline";	
				}
			}
			return comments;
 		}
	}
})();