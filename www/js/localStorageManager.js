 (function() {
 	angular.module('localStorageManager', [])

 	.service('localStorageManager', ['downloadManager', '$q', localStorageManager]);

 	function localStorageManager(downloadManager, $q){
		this.get = get;
		this.downloadFile = downloadFile;
		this.remove = remove;
		this.set = set;
		this.addandDownload = addandDownload;
		localStorage.setItem('momentRadiusInMiles', JSON.stringify(25));
		localStorage.setItem('totalLikes', "0");

		function get(storage) {
			if(storage !== 'timeSinceLastMoment') {
				//console logs here
			}

			if(localStorage.getItem(storage) !== null && localStorage.getItem(storage) !== "undefined") {
				return JSON.parse(localStorage.getItem(storage));
			}
			else {
				localStorage.setItem(storage, JSON.stringify([]));
				return [];
			}
		};

		function set(storage, items) {
			if(storage === "timeSinceLastMoment" || storage === "totalLikes") {
				localStorage.setItem(storage, items);
				return;
			}
			else {
				return downloadFile(storage, items).then(function(moment) {
					localStorage.setItem(storage, JSON.stringify(moment));
				}, function(error) {
					localStorage.setItem(storage, JSON.stringify(moment));
				}); 
			}
		};

		function addandDownload(storage, items) {
			if(!(items instanceof Array)) {
				var temp = [];
				temp.push(items);
				items = temp;
			}
			return downloadFile(storage, items).then(function() {
				var currentLocalStorage = get(storage);
				currentLocalStorage = currentLocalStorage.concat(items);
				localStorage.setItem(storage, JSON.stringify(currentLocalStorage));
			});
		}

		function remove(storage, item) {
			var currentLocalStorage = this.get(storage);
			if(currentLocalStorage.indexOf(item) !== -1) {
				currentLocalStorage.splice(currentLocalStorage.indexOf(item), 1);
				localStorage.setItem(storage, JSON.stringify(currentLocalStorage));
			}
		};

		function downloadFile(storage, items) {
			var deferred = $q.defer();
			if(storage === 'moments' ||
				storage === 'bestMoments' ||
				storage === 'myMoments') {
				downloadManager.downloadFiles(items).then(function(moments) {
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