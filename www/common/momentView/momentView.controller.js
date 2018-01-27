(function() {
	angular.module('MomentViewController', [])

	.controller('MomentViewController', ['downloadManager', '$sce' ,'common', '$scope', 'commentManager', MomentViewController]);
	function MomentViewController (downloadManager, $sce, common, $scope, commentManager) {
		var vm = this;
		$scope.vm.AWSurl = "https://s3.amazonaws.com/mng-moment/";
		$scope.flagClass = "ion-ios-flag-outline";
		$scope.updateComment = updateComment;
		$scope.vm.viewComments = viewComments;
		$scope.vm.flagged = flagged;
		$scope.vm.createVideogularObj = createVideogularObj;

		$scope.vm.commentsAndRepliesQuantity = 0;
		$scope.vm.flag = true
		initialize();

		function createVideogularObj() {
			if($scope.vm.moments.length > 0 && $scope.vm.moments[0].media === 'video') {
				createVideogularObj($scope.vm.moments[0].nativeurl);
			}
		}

		function setFlagBasedOnUsersUUID() {
			if($scope.moment.creator.includes(common.getUUID())) {
				$scope.vm.flag = false;
			}
		};

		function setCommentsAndRepliesQuantity() {
			for(var x = 0; x < $scope.vm.moments.length; x++){
				for(var y = 0; y < $scope.vm.moments[x].comments.length; y++) {
					$scope.vm.commentsAndRepliesQuantity = $scope.vm.commentsAndRepliesQuantity + $scope.vm.moments[x].comments[y].replies.length;
				}
			}
		};

		function initialize() {
			setFlagBasedOnUsersUUID();
			createVideogularObj();
			setCommentsAndRepliesQuantity();
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

		function viewComments() {
			$scope.vm.moment = $scope.vm.moments[0];
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