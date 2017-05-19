(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$scope', '$ionicContentBanner', 'core', 'components', '$q', '$ionicPopup', MomentsController]);

	function MomentsController (momentsService, $scope, $ionicContentBanner, core, components, $q, $ionicPopup) {
		var vm = this;
		vm.liked = liked;		
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;
		vm.flagged = flagged;

		vm.moments = JSON.parse(localStorage.getItem('moments'));;
		vm.flagClass = "ion-ios-flag-outline";
		vm.cardCSSClass = "layer-bottom";
		vm.swipedLeft = false;
		vm.swipedRight = false;

		if(momentsService.momentArray.length === 0 || core.didUserChangeRadius) {
			initialize();
		}

		function dragRight() {
			vm.moments[0].swipedRight = true;
			vm.moments[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.moments[0].swipedLeft = true;
			vm.moments[0].swipedRight = false;
		};

		function release() {
			if(vm.moments) {
				vm.moments[0].swipedRight = false;
				vm.moments[0].swipedLeft = false;
			}
		};		

		function initialize() { 
			components.showLoader().then(function() {
				momentsService.initializeView()
				.then(function(moments){
					vm.moments = moments;
					components.hideLoader();
				}, function(error) {
					console.log("ERRROR");
					components.hideLoader().then(function() {
						$ionicContentBanner.show({
							text: ["An error occured getting the Moment."],
							type: "error",
							autoClose: 3000
						});
					});
				}); //End of initializeView
			}); //End of popup;
		};

		function liked(liked) {
			momentsService.momentArray = vm.moments; //Moment Array in the service makes itself undefined for no reason

			sendReport().then(function() {
				momentsService.updateMoment(liked).then(function(moments) {
					components.hideLoader().then(function(){
						vm.moments = moments;
						vm.flagClass = "ion-ios-flag-outline";
					}, function(error) {
						initialize();
						}); //End of ionic Hide
				}, function(error) {
					components.hideLoader().then(function() {
						$ionicContentBanner.show({
							text: ["An error occured getting the next Moment."],
							type: "error",
							autoClose: 3000
						});
					});
					});//End of updateMoment
					});//End of sendReport
		};

		function sendReport() {
			var deferred = $q.defer();
			if(vm.disableFlag) {
				components.showLoader()
				.then(function() {
					momentsService.uploadReport(vm.report, momentsService.momentArray[0]).then(function() {
						deferred.resolve();
					}, function(error) {
					})
					vm.disableFlag = false;
					return deferred.promise;
			}); //End of ionic Loading
			} else {
				deferred.resolve();
			}
			return deferred.promise;
		};

		function flagged() {
			if(!vm.disableFlag) {
				vm.disableFlag = true;
				var popup = $ionicPopup.show({
					template: '<textarea ng-model="vm.report" placeholder="What\'s bothering you? (optional)" style="height: 100px; margin-bottom: 10px"> </textarea>',
					title: 'Report',
					scope: $scope,
					buttons: [ 
					{ text: 'Cancel',
					onTap: function(e) {
						vm.disableFlag = false;
					} 
				},
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						if(!vm.report) { 
								//Does nothing if user has not entered anything
								e.preventDefault();
							}
							else {
								vm.flagClass = "ion-ios-flag";
								$ionicContentBanner.show({
									text: ["You have flagged this Moment"],
									autoClose: 3000
								});
							};
						}
						
					}
					]
				});
			} else if(vm.report) {
				vm.disableFlag = false;
				vm.flagClass = "ion-ios-flag-outline";
				$ionicContentBanner.show({
					text: ["You have unflagged this Moment"],
					autoClose: 3000
				});
			}
		};
	}
})();