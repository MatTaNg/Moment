(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', 'myMomentsService', '$ionicPopup', '$scope', MyMomentsController]);
	function MyMomentsController(core, myMomentsService, $ionicPopup, $scope) {
		var vm = this;
		vm.myImages = JSON.parse(localStorage.getItem('myMoments'));
		vm.remove = remove;
		vm.feedback = feedback;

		initialize();

		function remove(location) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					core.remove(location);
					myMomentsService.removeFromLocalStorage(location);
					vm.myImages = JSON.parse(localStorage.getItem('myMoments'));

					if(vm.myImages.length === 0) {
						vm.errorMessage = true;
					}
				}
				else{

				}
			});
		};
		function feedback() {
			$scope.moment = {};

			var popup = $ionicPopup.show({
				template: '<textarea ng-model="vm.moment.feedback" style="height: 100px; margin-bottom: 10px"> </textarea>' + 
				'<ion-checkbox ng-model="vm.moment.isBug">Is this a bug?</ion-checkbox> {{vm.moment.feedback}}',
				title: 'Feedback',
				scope: $scope,
				subTitle: 'How can we improve?',
				buttons: [ 
				{ text: 'Cancel' },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!vm.moment.feedback) { 
							console.log("PREVENT DEFAULT");
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								myMomentsService.uploadFeedback(vm.moment.feedback, vm.moment.isBug);

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

		function initialize() {
			if(vm.myImages) {
				vm.errorMessage = false;
			}
			else {
				vm.errorMessage = true;
			}
		};
		
	};
})();