(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['core', 'constants', '$scope', '$interval', 'myMomentsService', '$ionicPopup', '$ionicLoading', '$scope', 'geolocation', MyMomentsController]);
	function MyMomentsController(core, constants, $scope, $interval, myMomentsService, $ionicPopup, $ionicLoading, $scope, geolocation) {
		var vm = this;
		vm.myImages = JSON.parse(localStorage.getItem('myMoments'));
		vm.totalLikes = 0;
		vm.oldLikes = 0;
		vm.remove = remove;
		vm.feedback = feedback;
		vm.showShortDescription = true;
		vm.toggleDescription = toggleDescription;
		vm.initialize = initialize;
		vm.userLocation = "Narberth, PA";
		vm.distance = localStorage.getItem('momentRadiusInMiles');
		initialize();

		$scope.$on("$locationChangeStart", function(event, next, current) { 
			if(current.indexOf("myMoments") !== -1) {
				localStorage.setItem('momentRadiusInMiles', vm.distance);
			}
		});

		function initialize() {
			geolocation.initializeUserLocation().then(function(location) {
				vm.userLocation = userLocation;
			});
			if(constants.DEV_MODE) {
				core.getHardCodedMoments().then(function(moments) {
					$scope.$broadcast('scroll.refreshComplete');
					vm.refresh = false;
					vm.myImages = moments;
					setOldLikes();
					for(var i = 0; i < vm.myImages.length; i++) {
						vm.totalLikes = vm.totalLikes + parseInt(vm.myImages[i].likes);
						vm.myImages[i].time = core.timeElapsed(vm.myImages[i].time);
						vm.myImages[i].description = "This text is 60 characters long This text is 60 characters l This text is 60 characters long This text is 60 characters l This text is 60 characters long This text is 60 characters l";
						if(vm.myImages[i].description.length > 0) {
							vm.myImages[i].shortDescription = vm.myImages[i].description.substring(0,50);
							vm.myImages[i].showShortDescription = true;
						}
					}
					calculateNumberOfExtraLikes();
					vm.errorMessage = false;
				});
			} else {
				if(vm.myImages) {
					$ionicLoading.show({
						template: '<ion-spinner></ion-spinner>'
					}).then(function() {
						setOldLikes();
						myMomentsService.initialize(vm.myImages).then(function(moments) {
							$scope.$broadcast('scroll.refreshComplete');
							vm.refresh = false;
							$ionicLoading.hide().then(function() {
								localStorage.setItem('myMoments', JSON.stringify(moments));
								for(var i = 0; i < vm.myImages.length; i++) {
									var gainedLikes = moments[i].likes - vm.myImages[i].likes;
									vm.myImages[i] = moments[i];
									vm.myImages[i].gainedLikes = gainedLikes;
									vm.totalLikes = vm.totalLikes + parseInt(vm.myImages[i].likes);
									calculateNumberOfExtraLikes();
									vm.myImages[i].time = core.timeElapsed(vm.myImages[i].time);
									if(vm.myImages[i].description.length > 0) {
										vm.myImages[i].shortDescription = vm.myImages[i].description.substring(0, 50);
										vm.myImages[i].showShortDescription = true;
									}
								}
								calculateNumberOfExtraLikes();
								vm.errorMessage = false;
							});
						});
					});
}
else {
	vm.errorMessage = true;
}
}
};

function setOldLikes() {
	for(var i = 0; i < vm.myImages.length; i++){
		vm.oldLikes = vm.oldLikes + parseInt(vm.myImages[i].likes);
	}
};

function calculateNumberOfExtraLikes() {
	vm.numberOfExtraLikes = vm.totalLikes - vm.oldLikes;
};

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
function toggleDescription(image) {
	if(image.showShortDescription) {
		image.showShortDescription = false;
	} else {
		image.showShortDescription = true;
	}
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
};
})();