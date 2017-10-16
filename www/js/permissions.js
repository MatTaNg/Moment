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
 			console.log("REQUEST PERMISSSION");
 			console.log(permission);
		    permission.hasPermission(permission.ACCESS_COARSE_LOCATION, function(status) {
		        console.log("HAS PERRMISSION!");
		        console.log(status);
		        if(!status.hasPermission) {
		        	 permission.requestPermission(permission.ACCESS_COARSE_LOCATION, success, error);
			         function error(error) {
			           console.log("REQUEST ERROR");
			           console.warn(error);
			           deferred.reject();
			         }
			         function success( status ) {
			           console.log("REQUEST SUCCESS");
			           console.log(status);
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