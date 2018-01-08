(function() {
	angular.module('MomentViewController', [])

	.controller('MomentViewController', ['$scope', 'commentManager', MomentViewController]);
	function MomentViewController ($scope, commentManager) {
		var vm = this;
		$scope.flagClass = "ion-ios-flag-outline";
		$scope.updateComment = updateComment;
		$scope.vm.viewComments = viewComments;
		$scope.vm.flagged = flagged;

		function updateComment(comment) {
			commentManager.updateComment(comment, this.momentArray);
		};

		function viewComments() {
			console.log("VIEW COMMENTS");
			console.log(vm);
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