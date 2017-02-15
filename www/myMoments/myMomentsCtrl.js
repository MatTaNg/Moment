angular.module('app.myMomentsCtrl', [])

.controller('myMomentsCtrl', ['$scope','coreSvc', 'myMomentsSvc', '$ionicPopup',
	function ($scope, coreSvc, myMomentsSvc, $ionicPopup) {
		$scope.myImages = JSON.parse(localStorage.getItem('myMoments'));
		$scope.moment = {};
		$scope.delete = function(location) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					coreSvc.delete(location);
					myMomentsSvc.removeFromLocalStorage(location);
					$scope.myImages = JSON.parse(localStorage.getItem('myMoments'));

					if($scope.myImages.length === 0) {
						$scope.errorMessage = true;
					}
				}
				else{

				}
			});
		};
		$scope.feedback = function() {
			var popup = $ionicPopup.show({
				template: '<textarea ng-model="moment.feedback" style="height: 100px; margin-bottom: 10px"> </textarea>' + 
				'<ion-checkbox ng-model="moment.isBug">Is this a bug?</ion-checkbox>',
				title: 'Feedback',
				subTitle: 'How can we improve?',
				scope: $scope,
				buttons: [ 
				{ text: 'Cancel' },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!$scope.moment.feedback) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								myMomentsSvc.uploadFeedback($scope.moment.feedback, $scope.moment.isBug);

								$ionicPopup.alert({
									title: '<b>Thank you for your feedback!</b>',
									template: '<img width="100%" height="100%" src="/img/thankYou.png"></img>'
								});
							};
						}
						
					}
					]
				});
		};

		if($scope.myImages.length === 0) {
			$scope.errorMessage = true;
		}
		else {
			$scope.errorMessage = false;
		}
	}]) 
