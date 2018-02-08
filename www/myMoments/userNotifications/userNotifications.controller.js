(function() {
	angular.module('UserNotificationsController', [])

	.controller('UserNotificationsController', ['notificationManager', '$scope', '$ionicPopup', 'commentManager', 'localStorageManager', userNotificationsController]);

	function userNotificationsController(notificationManager, $scope, $ionicPopup, commentManager, localStorageManager) {
		var vm = this;
		vm.editNotifications = editNotifications;

		vm.userName = commentManager.getUserName();

		vm.notificationText = "Notifications off";
		vm.notifications = notificationManager.getNotificationStatus();
		setNotificationValuesBasedOnUserInput(vm.notifications);

		function editNotifications() {
			var popUp = $ionicPopup.show({
				template: '<ion-checkbox ng-repeat="item in vm.notifications" ng-model="item.notification" ng-checked="item.notification">' +
				'<span class="notificationsFont">{{item.settingsText}}</span></ion-checkbox>',
				title: 'Notification Settings',
				scope: $scope,
				buttons: [ 
				{
					text: 'Cancel',
					onTap: function(e) {
						vm.notifications = localStorageManager.get('notificationStatus');
					}
				},
				{
					text: '<b>Ok</b>',
					type: 'button-positive',
					onTap: function(e) {
						localStorageManager.set('notificationStatus', vm.notifications);
						vm.notificationText = "Notifications off";
						setNotificationValuesBasedOnUserInput(vm.notifications);
					}
						
				}]
				});
		};

		function setNotificationValuesBasedOnUserInput(notifications) {
			for(var i = 0; i < notifications.length; i++) {
				if(notifications[i].notification === false) {
					notificationManager.toggleNotification(notifications[i].id, false);
				}
				else {
					notificationManager.toggleNotification(notifications[i].id, true);
					vm.notificationText = "Notifications on";
				}
			}
		}

	};
}());