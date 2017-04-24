(function() {
	angular.module('app.MomentsController', [])

	.controller('MomentsController', ['momentsService', '$stateParams', '$scope', '$ionicContentBanner', '$window', 'core', '$rootScope', '$ionicPopup', '$q', 'constants', MomentsController]);

	function MomentsController (momentsService, $stateParams, $scope, $ionicContentBanner, $window, core, $rootScope, $ionicPopup, $q, constants) {
		// if(constants.DEV_MODE) {
			// localStorage.setItem('timeSinceLastMoment', "0m");
		// }

		var vm = this;
		vm.currentImage;
		vm.moment = {toggleDescription: "expanded"};
		// localStorage.setItem('moments', JSON.stringify([]));
		getMomentsFromLocalStorage();
		function getMomentsFromLocalStorage() {
			if(JSON.parse(localStorage.getItem('moments'))) {
				vm.imageArray = JSON.parse(localStorage.getItem('moments'));
				for(var i = 0; i < vm.imageArray.length; i++) {
					vm.imageArray[i].class = "layer-bottom";
					vm.imageArray[i].time = core.timeElapsed(vm.imageArray[i].time);
				}
				vm.imageArray[0].class = "layer-top";
			}
			else {
				vm.imageArray = [];
			}
		};
		vm.flagClass = "ion-ios-flag-outline";
		vm.counter = 0;
		vm.showHR = false;
		vm.cardCSSClass = "layer-bottom";
		vm.swipedLeft = false;
		vm.swipedRight = false;
		vm.liked = liked;		
		vm.toggleDescription = toggleDescription;
		vm.dragRight = dragRight;
		vm.dragLeft = dragLeft;
		vm.release = release;
		vm.flagged = flagged;

		this.cards = {};

		function dragRight() {
			vm.imageArray[0].swipedRight = true;
			vm.imageArray[0].swipedLeft = false;
		};

		function dragLeft() {
			vm.imageArray[0].swipedLeft = true;
			vm.imageArray[0].swipedRight = false;
		};

		function release() {
			if(vm.imageArray) {
				vm.imageArray[0].swipedRight = false;
				vm.imageArray[0].swipedLeft = false;
			}
		};		

		if(vm.imageArray.length === 0) {
			initialize();
		}
		function initialize() { 
			updateView();
		};

		function updateView() {
			vm.imageArray = [];
			momentsService.initializeView()
			.then(function(moments){
				if(moments.length > 0) {
					vm.imageArray = updateObject(moments);
				}
			}, function(error) {
				vm.currentImage = undefined;
			});
		};

		function liked(liked) {
			console.log("LIKED");
			sendReport().then(function() {
				console.log("SEND REPORT");
				momentsService.updateMoment(liked).then(function(moments) {
					vm.flagClass = "ion-ios-flag-outline";
					if(moments.length > 0) {
						vm.imageArray = updateObject(moments);
					}
					else {
						vm.imageArray = [];
					}
				}, function(error) {
					updateView();
				});
			});


		};

		function sendReport() {
			var deferred = $q.defer();
			if(vm.disableFlag) {
				momentsService.uploadReport(vm.report, vm.imageArray[0]).then(function() {
					deferred.resolve();
				}, function() {
					$ionicContentBanner.show({
						text: ["Something went wrong while uploading your flag.  Our fault - We apologize"],
						autoClose: 3000
					});
				})
			} else {
				deferred.resolve();
			}
			vm.disableFlag = false;
			return deferred.promise;
		};

		function updateObject(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].class = "layer-bottom";
				moments[i].time = core.timeElapsed(moments[i].time);
			}
			moments[0].class = "layer-top";
			if(moments.length > 1) {
				moments[1].class = "layer-next";
			}
			return moments;
		};

		function toggleDescription() {
			if(vm.moment.toggleDescription === "contracted")
				vm.moment.toggleDescription = "expanded";
			else
				vm.moment.toggleDescription = "contracted";
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
	};
})();