(function() {
	angular.module('MomentViewController', [])

	.controller('MomentViewController', ['$ionicPopup', 'downloadManager', '$sce' ,'common', '$scope', 'commentManager', MomentViewController]);
	function MomentViewController ($ionicPopup, downloadManager, $sce, common, $scope, commentManager) {
		var vm = this;
		$scope.vm.AWSurl = "https://s3.amazonaws.com/mng-moment/";
		$scope.flagClass = "ion-ios-flag-outline";
		$scope.updateComment = updateComment;
		$scope.vm.viewComments = viewComments;
		$scope.vm.flagged = flagged;
		$scope.vm.createVideogularObj = createVideogularObj;
		$scope.vm.setCommentsAndRepliesQuantity = setCommentsAndRepliesQuantity;

		$scope.vm.showComments = false;
		$scope.vm.commentsAndRepliesQuantity = 0;
		$scope.vm.flag = true
		initialize();

		function setFlagBasedOnUsersUUID() {
			if($scope.moment.creator.includes(common.getUUID())) {
				$scope.vm.flag = false;
			}
		};

		function setCommentsAndRepliesQuantity(moment) {
			var comments = moment.comments;
			if(!comments) { //Theres a bug where moment.comments === undefined don't know how to reproduce
				comments = [];
			}
			moment.commentsAndRepliesQuantity = comments.length;
			for(var x = 0; x < comments.length; x++){
				moment.commentsAndRepliesQuantity = moment.commentsAndRepliesQuantity + comments[x].replies.length;
			}
		};

		function initialize() {
			console.log("Moment View Controller", $scope.moment);
			$scope.moment.time = common.timeElapsed($scope.moment.time);
			setFlagBasedOnUsersUUID();
			if($scope.moment.media === 'video') {
				createVideogularObj($scope.moment.nativeurl);
			}
			setCommentsAndRepliesQuantity($scope.moment);
		};

		function createVideogularObj(src) {
			$scope.vm.config = {
		        sources: [
		          {src: $sce.trustAsResourceUrl(src), type: "video/mp4"},
		        ],
		        tracks: [
		          {
		            src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
		            kind: "subtitles",
		            srclang: "en",
		            label: "English",
		            default: ""
		          }
		        ],
		        theme: "lib/videogular-themes-default/videogular.css",
		        plugins: {
		          poster: "http://www.videogular.com/assets/images/videogular.png"
		        }
		     };
		};

		function updateComment(comment) {
			commentManager.updateComment(comment, this.momentArray);
		};

		function viewComments(moment) {
			$scope.vm.moment = moment;
			$scope.vm.showComments = !$scope.vm.showComments;
		};

		function flagged() {
			if(!$scope.disableFlag) {
				$scope.disableFlag = true;
				var popup = $ionicPopup.show({
					template: '<textarea ng-model="$scope.report" placeholder="What\'s bothering you? (optional)" style="height: 100px; margin-bottom: 10px"> </textarea>',
					title: 'Report',
					scope: $scope,
					buttons: [ 
					{ text: 'Cancel',
					onTap: function(e) {
						$scope.disableFlag = false;
					} 
				},
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!$scope.report) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								$scope.flagClass = "ion-ios-flag";
								$ionicContentBanner.show({
									text: ["You have flagged this Moment"],
									autoClose: 3000
								});
							};
						}
						
					}
					]
				});
			} else if($scope.report) {
				$scope.disableFlag = false;
				$scope.flagClass = "ion-ios-flag-outline";
				$ionicContentBanner.show({
					text: ["You have unflagged this Moment"],
					autoClose: 3000
				});
			}
		};
	}
})();