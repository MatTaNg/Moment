(function() {
	angular.module('CommentsController', [])

	.controller('CommentsController', ['common', '$scope', '$ionicPlatform', 'localStorageManager', 'commentManager', '$ionicPopup', '$ionicLoading', 'core', 'notificationManager', 'logger', CommentsController]);
	function CommentsController (common, $scope, $ionicPlatform, localStorageManager, commentManager, $ionicPopup, $ionicLoading, core, notificationManager, logger) {
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

		vm.uuid = common.getUUID();
		vm.comments = vm.moment.comments;
		vm.showReplyBox = false;
		vm.submitCommentSpinner = false;
		var index = vm.momentsArray.indexOf(vm.moment);

		console.log("###", vm.moment);
		console.log("###", vm.momentsArray);
		console.log("###", vm.showComments);

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
            commentManager.updateComment(comment, vm.moment).then(function() {
                comment.editMode = false;
                modifyMomentArrayAndSaveIt();
            });
        };

        function modifyMomentArrayAndSaveIt() {
			vm.moment.comments = vm.comments;
    		vm.momentsArray[index] = vm.moment;
			localStorageManager.set(vm.localStorageName, vm.momentsArray);        
		};

        function reply(comment) {
        	vm.replyCommentSpinner = true;
        	var indexOfComment = vm.comments.indexOf(comment);
        	commentManager.uploadComment(comment.replyComment, comment).then(function(reply) {
				vm.comments[indexOfComment].replies.push(reply);
				comment.replyMode = false;
        		comment.showReplies = true;
        		modifyMomentArrayAndSaveIt();
        		comment.replyComment = "";
        		vm.replyCommentSpinner = false;
        		vm.commentsAndRepliesQuantity++;
        	});
        };

		function submitComment() {
			vm.submitCommentSpinner = true;
			commentManager.uploadComment(vm.comment, common.populateMomentObj(vm.moment)).then(function(comment) {
				vm.comments.push(comment);
				modifyMomentArrayAndSaveIt();
				vm.comment = "";
				vm.submitCommentSpinner = false;
				vm.commentsAndRepliesQuantity++;
			});
		};

		function removeComment(comment) {
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
			vm.commentsAndRepliesQuantity--;
		}

		function deleteComment(comment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					commentManager.deleteComment(comment, comment.parent).then(function() {
					}, function (error) {
						if(error) {
							var params = { comment : comment}
							logger.logFile("commentsController.deleteComment", params, error, 'errors.txt');
						}
					});
					removeComment(comment);
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
				comment.likesuuids = comment.likesuuids + " " + vm.uuid;
				commentManager.updateComment(comment);
			}
			else {
				comment.likes--;
				comment.likedClass = "ion-android-favorite-outline";
				comment.likesuuids = comment.likesuuids.replace(common.getUUID(), '');
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