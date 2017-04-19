(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', 'myMomentsService', '$ionicPopup', '$ionicLoading', '$scope', MyMomentsController]);
	function MyMomentsController(core, myMomentsService, $ionicPopup, $ionicLoading, $scope) {
		var vm = this;
		vm.myImages = JSON.parse(localStorage.getItem('myMoments'));
		vm.remove = remove;
		vm.feedback = feedback;

		initialize();

		function remove(moment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					core.remove(moment).then(function() {
						myMomentsService.removeFromLocalStorage(moment);
						vm.myImages = JSON.parse(localStorage.getItem('myMoments'));

						if(vm.myImages.length === 0) {
							vm.errorMessage = true;
						}	
					}, function(error) {
						console.log("REMOVE FAILED");
						console.log(error);
					});
					
				}
				else{
					console.log("!CONFIRM");
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
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								myMomentsService.uploadFeedback(vm.moment.feedback, vm.moment.isBug).then(function() {
									$ionicPopup.alert({
										title: '<b>Thank you for your feedback!</b>',
										template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
									});
								}, function(error) {
									$ionicPopup.alert({
										title: '<b>Something went wrong.  Sorry, our fault!</b>',
										template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
									});
								});

							};
						}
						
					}
					]
				});
};

function initialize() {
	if(vm.myImages) {
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>'
		}).then(function() {
			myMomentsService.initialize(vm.myImages).then(function(moments) {
				$ionicLoading.hide();
				console.log("MOMENTS");
				console.log(JSON.stringify(moments));
			});

			for(var i = 0; i < vm.myImages.length; i++) {
				vm.myImages.time = core.timeElapsed(vm.myImages.time);
				console.log(vm.myImages.time);
			}
			vm.errorMessage = false;
		});
	}
	else {
		vm.errorMessage = true;
	}
};

};
})();