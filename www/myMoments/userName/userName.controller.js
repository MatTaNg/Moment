(function() {
	angular.module('UserNameController', [])

	.controller('UserNameController', ['$scope', '$ionicPopup', 'commentManager', UserNameController ]);

	function UserNameController($scope, $ionicPopup, commentManager) {
		var vm = this;
		vm.editUserName = editUserName;

		vm.userName = commentManager.getUserName();

		function editUserName() {
			var temp = vm.userName;
			var focus = true;
			var popUp = $ionicPopup.show({
				template: '<input mng-auto-focus ng-model="vm.userName" style="width:90%;"> </input>' +
				'<span style="color: red; font-size:12px" ng-if="vm.userNameTaken">This user name has been taken</span>',
				title: 'User Name',
				scope: $scope,
				buttons: [ 
				{ text: 'Cancel',
					onTap: function(e) {
						vm.userName = temp;
					}
				 },
				{
					text: '<b>Submit</b>',
					type: 'button-positive',
					onTap: function(e) {
						e.preventDefault();
						commentManager.setUserName(vm.userName).then(function(data) {
							if(data === "User name taken") {
								vm.userNameTaken = true;
							}
							else {
								popUp.close();
							}
						});
					}
						
				}
				]
			});
		};
	};
}());