(function() {
	angular.module('MyMomentsController', [])

	.controller('MyMomentsController', ['common', '$ionicLoading', '$sce','core', '$rootScope', 'constants', '$q', 'myMomentsService', '$ionicPopup', 'components', '$scope', 'geolocation', '$ionicContentBanner', 'localStorageManager', MyMomentsController]);
	function MyMomentsController(common, $ionicLoading, $sce, core, $rootScope, constants, $q, myMomentsService, $ionicPopup, components, $scope, geolocation, $ionicContentBanner, localStorageManager) {
		var vm = this;
		vm.initialize = initialize;
		vm.remove = remove;
		vm.feedback = feedback;
		vm.toggleDescription = toggleDescription;
		vm.refreshing = refreshing;
		vm.toggleCommentTray = toggleCommentTray;
		vm.toggleMomentView = toggleMomentView;
		vm.viewComments = viewComments;

		vm.moments = localStorageManager.get('myMoments') || [];
		vm.myMoments = localStorageManager.get('myMoments') || [];
		vm.momentsWithComments = localStorageManager.get('myMomentsWithComments') || [];
		vm.totalLikes = localStorageManager.get('totalLikes');
		vm.showShortDescription = true;
		vm.loading = false;
		vm.initRunning = false;
		vm.displayCommentTray = false;
		vm.showCommentSpinner = false;
		vm.momentView = localStorageManager.get('momentView');

		vm.showComments = false;
		vm.moment = {};
		vm.comments = {};

		if(!(vm.moments)) {
			vm.moments = [];
		}

		initialize();

		if(vm.customUserLocation) {
			watchForLocationChange();	
		}

		function viewComments(moment) {
			vm.moment = moment;
			vm.showComments = !vm.showComments;
		};

		function toggleMomentView() {
			if(vm.momentView) {
				vm.moments = vm.myMoments;
				localStorageManager.set('momentView', false);
				vm.momentView = false;
			} else {
				vm.moments = vm.momentsWithComments;
				localStorageManager.set('momentView', true);
				vm.momentView = true;
			}
		};

		function toggleCommentTray() {
			vm.displayCommentTray = !vm.displayCommentTray;
		};

		function refreshing() {
			initialize().then(function() {
				$scope.$broadcast('scroll.refreshComplete');
			}, function(error) {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function removeNullObject(moments) {
			for(var i = 0; i < moments.length;){ //initialize returns a null object if it cannot find it.  Remove it
				if(!moments[i]) {
					moments.splice(i, 1);
				} else {
					i++;
				}
			}
			return moments;
		};

		function initializeMomentsBasedOnLocalStorage() {
			if(vm.momentView === true) {
				vm.moments = vm.momentsWithComments;
			}
			else {
				vm.moments = vm.myMoments;
			}
		}

		function findAndSetTheUsersLocation() {
			if(!geolocation.customUserLocation) {
				geolocation.setLocation();
			}
		};

		function initializeCurrentMomentValuesAndSetLoadingIcon() {
			if(vm.moments.length === 0){
				vm.loading = true;
			}
			else {
				for(var i = 0; i < vm.moments.length; i++ ){
					vm.moments[i].time = common.timeElapsed(vm.moments[i].time);
				}
			}
		};

		function turnOffAllLoadingIndicators() {
			vm.refresh = false;
			vm.loading = false;
			vm.errorMessage = false;
			vm.showCommentSpinner = false;
		};

		function initialize() {
			initializeMomentsBasedOnLocalStorage();
			findAndSetTheUsersLocation();
			initializeCurrentMomentValuesAndSetLoadingIcon();
			
			var deferred = $q.defer();
			myMomentsService.retrieveCommentedOnMoments().then(function(moments) {
				localStorageManager.set('myMomentsWithComments', moments);
				vm.momentsWithComments = moments;
				initializeMomentsBasedOnLocalStorage();
			});
			if(vm.moments !== [] && vm.initRunning === false) {
				vm.initRunning = true;
				myMomentsService.initialize().then(function(moments) {
					vm.initRunning = false;
					moments = removeNullObject(moments); //Band-aid
					if(moments !== null && moments.length > 0) {
						vm.myMoments = moments;
						vm.totalLikes = myMomentsService.getTotalLikes();
						vm.extraLikes = myMomentsService.getExtraLikes();
						turnOffAllLoadingIndicators();
						initializeMomentsBasedOnLocalStorage();
					} else {
						vm.loading = false;
						vm.moments = [];
					}
					deferred.resolve();
				}, function(error) {
					vm.initRunning = false;
					$ionicContentBanner.show({
						text: ["There was a problem getting the moments"],
						type: "error",
						autoClose: 3000
					});
					deferred.reject();
				});
			}
			else {
				vm.errorMessage = true;
				deferred.reject();
			}
			return deferred.promise;
		};

		function removeFromBestMoments(moment) {
			var subString = moment.key.substring(moment.key.indexOf(constants.MOMENT_PREFIX), moment.key.indexOf(constants.MOMENT_PREFIX.length - 1));
			var bestMomentKey = moment.key.replace(/\/moment\/../, "/bestMoments");
			moment.key = bestMomentKey
			return core.remove(moment);
		};

		function remove(moment) {
			$ionicPopup.confirm({
				title: 'Are you sure you want to delete this moment?'
			})
			.then(function(confirm) {
				if(confirm) {
					$ionicLoading.show({}).then(function() {
						core.remove(moment).then(function() {
							removeFromBestMoments(moment);
							myMomentsService.removeFromLocalStorage(moment);
							vm.moments.splice(vm.moments.indexOf(moment), 1);
							$ionicLoading.hide();
							if(vm.moments.length === 0) {
								vm.errorMessage = true;
							}	
							}, function(error) {
								$ionicLoading.hide();
							});
						}, function(error) {
							$ionicLoading.hide();
						});

				} else{
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

			$ionicPopup.show({
				template: '<textarea ng-model="vm.moment.feedback" style="height: 100px; margin-bottom: 10px"> </textarea>' + 
				'<ion-checkbox ng-model="vm.moment.isBug">Is this a bug?</ion-checkbox>' +
				'<label class="item item-input"> Email: <input style="margin-left: 2px;" ng-model = "vm.email" type = "text" placeholder = "Optional"> </input> </label>',
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
								components.showLoader().then(function() {
									if(vm.email) {
										vm.moment.feedback = vm.moment.feedback + '\r\n\r\n' + vm.email;
									}
									myMomentsService.uploadFeedback(vm.moment.feedback, vm.moment.isBug).then(function() {
										components.hideLoader();
										$ionicPopup.alert({
											title: '<b>Thank you for your feedback!</b>',
											template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
										});
									}, function(error) {
										components.hideLoader();
										$ionicPopup.alert({
											title: '<b>Something went wrong.  Sorry, our fault!</b>',
											template: '<img width="100%" height="100%" src="img/ThankYou.png"></img>'
										});
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