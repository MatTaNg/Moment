 (function() {
 	angular.module('localStorageManager', [])

 	.service('localStorageManager', [localStorageManager]);

 	function localStorageManager(){
		this.get = get;
		this.set = set;
		localStorage.setItem('momentRadiusInMiles', JSON.stringify(25));

		function get(storage) {
			if(localStorage.getItem(storage)) {
				return JSON.parse(localStorage.getItem(storage));	
			}
			else {
				set(storage, []);
				return false;
			}
			
		};

		function set(storage, item) {
			localStorage.setItem(storage, JSON.stringify(item));
		};

	}
})();