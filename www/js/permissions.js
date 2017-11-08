 (function() {
 	angular.module('permissions', [])

 	.service('permissions', ['$q', permissions]);

 	function permissions($q){
			
 		var vm = this;
 		vm.checkPermission = checkPermission;
 		vm.requestPermissions = requestPermissions;

 		function checkPermission(permission) {
 			if(cordova) {
	 			var permissions = cordova.plugins.permissions;
	 			if(permission === "location") {
	 				return requestPermissions(permissions);
	 			}
 			}
 		};

 		function requestPermissions(permission) {
 			var deferred = $q.defer();
		    permission.hasPermission(permission.ACCESS_COARSE_LOCATION, function(status) {
		        if(!status.hasPermission) {
		        	 permission.requestPermission(permission.ACCESS_COARSE_LOCATION, success, error);
			         function error(error) {
			           console.warn(error);
			           deferred.reject();
			         }
			         function success( status ) {
			           if( !status.hasPermission ) error();
			           deferred.resolve();
		          	}
	       		} else {
	       			deferred.resolve();
	       		}
	     	 });
		    return deferred.promise;
 		}
	};
})();