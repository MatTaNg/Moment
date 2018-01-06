(function() {
	angular.module('components', [])

	.service('components', ['$ionicContentBanner', '$ionicPopup', '$ionicLoading', components]);

	function components($ionicContentBanner, $ionicPopup, $ionicLoading) {
		var vm = this;
		vm.showLoader = showLoader;
		vm.hideLoader = hideLoader;
		vm.showFeedbackPopUp = showFeedbackPopUp;
		vm.showEditLocationPopUp = showEditLocationPopUp;

		function showLoader() {
			return $ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
		};

		function hideLoader() {
			return $ionicLoading.hide();
		};

		function showEditLocationPopUp(editLocation) {
			var popUp = $ionicPopup.show({
				template: '<input ng-model="vm.location"> </input>' +
							'<span style="color: red; font-size:12px" ng-if="vm.locationErrorMsg">We could not find this location</span>',
				title: 'Location',
				buttons: [ 
				{ text: 'Cancel' },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						console.log("TAPPED");
						console.log(vm.location);
						if(!vm.location) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								e.preventDefault();
								editLocation(vm.location).then(function() {
									popUp.close();
								}, function(error) {
									console.log("ERROR");
									e.preventDefault();
								});
							};
						}
						
					}
					]
				});
		}

		function showFeedbackPopUp() {
			$ionicPopup.show({
				template: '<textarea ng-model="vm.moment.feedback" style="height: 100px; margin-bottom: 10px"> </textarea>' + 
				'<ion-checkbox ng-model="vm.moment.isBug">Is this a bug?</ion-checkbox>',
				title: 'Feedback',
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
};
}());