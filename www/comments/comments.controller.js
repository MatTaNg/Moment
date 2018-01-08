(function() {
	angular.module('CommentsController', [])

	.controller('CommentsController', ['$scope', '$ionicPlatform', 'localStorageManager', 'commentManager', '$ionicPopup', '$ionicLoading', 'core', 'notificationManager', 'logger', '$stateParams', '$state', CommentsController]);
	function CommentsController ($scope, $ionicPlatform, localStorageManager, commentManager, $ionicPopup, $ionicLoading, core, notificationManager, logger, $stateParams, $state) {
		var vm = this;
		vm.exitView = exitView;
		vm.editComment = editComment,
		vm.submitComment = submitComment;
		vm.toggleLike = toggleLike;
		vm.toggleEditBox = toggleEditBox;
		vm.deleteComment = deleteComment;
		vm.toggleReplyBox = toggleReplyBox;
		vm.toggleReplies = toggleReplies;
		vm.reply = reply;
console.log("ASDASD");
console.log(vm);
		vm.uuid = core.getUUID();
		vm.comments = vm.moment.comments;
		vm.showReplyBox = false;
		vm.submitCommentSpinner = false;
		var index = vm.momentsArray.indexOf(vm.moment);

		function toggleReplies(comment) {
			comment.showReplies = !comment.showReplies;
		};

		function toggleReplyBox(comment) {
			comment.replyMode = !comment.replyMode;
		};

		function exitView() {
			vm.showComments = false;
		};

        function editComment(comment) {
            $ionicLoading.show({}).then(function() {
                commentManager.updateComment(comment, vm.moment).then(function() {
                    // vm.comments[vm.comments.indexOf(comment)] = comment;
                    comment.editMode = false;
                    modifyMomentArrayAndSaveIt();
                    $ionicLoading.hide();
                });
            });
        };

        function modifyMomentArrayAndSaveIt() {
			vm.moment.comments = vm.comments;
    		vm.momentsArray[index] = vm.moment;
    		console.log("MODIFY MOMENT ARRAY");
    		console.log(vm.momentsArray);
			localStorageManager.set(vm.localStorageName, vm.momentsArray);        
		};

        function reply(comment) {
        	var indexOfComment = vm.comments.indexOf(comment);
        	// vm.comments[indexOfComment].likedClass = "ion-android-favorite-outline";
        	commentManager.uploadComment(comment.replyComment, comment).then(function(reply) {
        		// if(!vm.comments[indexOfComment].replies) {
        		// 	vm.comments.replies = [];
        		// }
        		// notificationManager.notifyUserRepliesToComment(comment.onesignalid);
				vm.comments[indexOfComment].replies.push(reply);
				vm.toggleReplies(comment);
        		vm.toggleReplyBox(comment);
        		modifyMomentArrayAndSaveIt();
        		comment.replyComment = "";
        	});
        };

		function submitComment() {
			vm.submitCommentSpinner = true;
			commentManager.uploadComment(vm.comment, core.populateMomentObj(vm.moment)).then(function(comment) {
				// notificationManager.notifyUserRepliesToMoment(comment.onesignalid);
				vm.comments.push(comment);
				modifyMomentArrayAndSaveIt();
				vm.comment = "";
				vm.submitCommentSpinner = false;
			});
		};


		function deleteComment(comment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					$ionicLoading.show({}).then(function() {
						commentManager.deleteComment(comment, comment.parent).then(function() {
							if(vm.comments.indexOf(comment) === -1) { //This means the parent is a comment
								for(var i = 0; i < vm.comments.length; i++) {
									if(vm.comments[i].replies.indexOf(comment) !== -1 ) {
										vm.comments[i].replies.splice(vm.comments[i].replies.indexOf(comment), 1);
									}
								}

							} else {
								vm.comments.splice(vm.comments.indexOf(comment), 1);
							}
							modifyMomentArrayAndSaveIt();
							$ionicLoading.hide();
						}, function (error) {
							if(error) {
								var params = { comment : comment}
								logger.logFile("commentsController.deleteComment", params, error, 'errors.txt');
							}
							$ionicLoading.hide();
						});
					});
				}
				else{
					console.log("!CONFIRM");
				}
			});
		};

		function toggleEditBox(comment) {
			if(comment.editMode === false) {
				comment.editMode = true;
			}
			else {
				comment.editMode = false;
			}
		};

		function toggleLike(comment) {
			if(comment.likedClass === "ion-android-favorite-outline") {
				comment.likes++;
				comment.likedClass = "ion-android-favorite";	
				commentManager.updateComment(comment);
			}
			else {
				comment.likes--;
				comment.likedClass = "ion-android-favorite-outline";
				commentManager.updateComment(comment);
			}
			vm.comments[vm.comments.indexOf(comment)] = comment;
			modifyMomentArrayAndSaveIt();
		};

	    var deregisterSecond = $ionicPlatform.registerBackButtonAction(function() {
	        vm.exitView();
	    }, 100);
	    $scope.$on('$destroy', deregisterSecond);
	}
})();