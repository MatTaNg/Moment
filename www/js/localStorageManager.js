 (function() {
 	angular.module('localStorageManager', [])

 	.service('localStorageManager', ['core', '$q', localStorageManager]);

 	function localStorageManager(core, $q){
		this.get = get;
		this.downloadFile = downloadFile;
		this.remove = remove;
		this.set = set;
		this.addandDownload = addandDownload;
		localStorage.setItem('momentRadiusInMiles', JSON.stringify(25));

		function get(storage) {
			if(storage !== 'timeSinceLastMoment') {
				// console.log("GET " + storage); 
				// console.log(typeof localStorage.getItem(storage) === 'undefined'); 
				// console.log(localStorage.getItem(storage) === null); 
			}
			if(localStorage.getItem(storage) !== null && localStorage.getItem(storage) !== "undefined") {
				if(storage !== 'timeSinceLastMoment') { console.log(JSON.parse(localStorage.getItem(storage))); }
				return JSON.parse(localStorage.getItem(storage));
			}
			else {
				set(storage, JSON.stringify([]));
				return false;
			}
		};

		function set(storage, items) {
			return downloadFile(storage, items).then(function(moment) {
				localStorage.setItem(storage, JSON.stringify(moment));
			}); 
		};

		function addandDownload(storage, item) {
			console.log("ADD AND DOWNLOAD");
			console.log(storage);
			console.log(item);
			return downloadFile(storage, item).then(function() {
				var currentLocalStorage = this.get(storage);
				currentLocalStorage.push(item);
				localStorage.setItem(storage, JSON.stringify(currentLocalStorage));
				console.log(this.get(storage));
			});
		}

		function remove(storage, item) {
			var currentLocalStorage = this.get(storage);
			currentLocalStorage.splice(storage.findIndex(item), 1);
			localStorage.setItem(storage, JSON.stringify(currentLocalStorage));
		};

		function downloadFile(storage, items) {
			var deferred = $q.defer();
			if(storage === 'moments' ||
				storage === 'bestMoments' ||
				storage === 'myMoments') {
				core.downloadFiles(items).then(function(moments) {
					deferred.resolve(moments);
				});
			}
			else {
				deferred.resolve();	
			}
			return deferred.promise;
		};

	}
})();