   (function() {
 	angular.module('localStorageManager', [])

 	.service('localStorageManager', ['downloadManager', '$q', localStorageManager]);

 	function localStorageManager(downloadManager, $q){
		this.get = get;
		this.downloadFile = downloadFile;
		this.remove = remove;
		this.set = set;
		this.addandDownload = addandDownload;
		this.getAndDownload = getAndDownload;
		localStorage.setItem('momentRadiusInMiles', JSON.stringify(25));
		localStorage.setItem('totalLikes', "0");

		function getAndDownload(storage) {
			var deferred = $q.defer();
			if(localStorage.getItem(storage) !== null && localStorage.getItem(storage) !== "undefined") {
				try {
					var moments = JSON.parse(localStorage.getItem(storage));
					downloadManager.downloadFiles(moments).then(function(moments) {
						deferred.resolve(moments);
					});
				} catch(e) {
					deferred.resolve(localStorage.getItem(storage));
				}
			}
			else {
				localStorage.setItem(storage, JSON.stringify([]));
				deferred.resolve([]);
			}
			return deferred.promise;
		};

		function get(storage) {
			if(storage !== 'timeSinceLastMoment') {
				//console logs here
			}
			if(localStorage.getItem(storage) !== null && localStorage.getItem(storage) !== "undefined") {
				convertStringToBooleanValue(localStorage.getItem(storage));
				try {
					return JSON.parse(localStorage.getItem(storage));
				} catch(e) {
					return localStorage.getItem(storage);
				}
			}
			else {
				localStorage.setItem(storage, JSON.stringify([]));
				return [];
			}
		};

		function convertStringToBooleanValue(value) {
			if(value === 'true') {
				return true;
			}
			else if(value === 'false') {
				return false;
			}
			else {
				return value;
			}
		}

		function convertBooleanValueToString(value) {
			if(typeof value === 'boolean') {
				if(value === true) {
					value = 'true';
				}
				else if(value === false) {
					value = 'false';
				}
			}
			return value;
		}

		function set(storage, items) {
			items = convertBooleanValueToString(items);
			var deferred = $q.defer();
			if(items && typeof items === 'object' && items.constructor === Array) {
				if(items.length > 0 && verifyMetaData(items[0])) { //Is an array of Moments
					downloadFile(storage, items).then(function(moments) {
						localStorage.setItem(storage, JSON.stringify(moments));
						deferred.resolve(moments);
					}, function(error) {
						localStorage.setItem(storage, JSON.stringify(moments));
						deferred.reject(error);
					}); 
				}
				else { //Is an Array but not an array of Moments
					localStorage.setItem(storage, JSON.stringify(items));
					deferred.resolve(items);
				}
			}
			else {
				localStorage.setItem(storage, items);
				deferred.resolve(items);
			}
			return deferred.promise;
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
					console.log("!!!!");
					console.log()
					deferred.resolve(moments);
				});
			}
			else {
				deferred.resolve();	
			}
			return deferred.promise;
		};

		function verifyMetaData(moment) {
			if(!moment.key) {
				return false;
			}
			if(moment.key.includes('reports')) {
				return true;
			}

			if(	moment.key !== undefined &&
				moment.location !== undefined &&
				moment.likes !== undefined &&
				moment.description !== undefined &&
				moment.time !== undefined &&
				moment.views !== undefined &&
				moment.uuids !== undefined &&
				moment.media !== undefined &&
				moment.commentids !== undefined)
				return true; 
			else { 
				// var error = [];
				// for(var property in moment) {
				// 	console.log("PROPERTY");
				// 	console.log(property);
				// 	console.log(moment);
				// 	console.log(moment.key);z
				// 	console.log(moment.property);
				//   if (moment.hasOwnProperty(property)) {
				//   	if(!moment.property) {
				//   		error.push(property);
				//   	}
				//   }
				// }
				return false;
			}
		};  

	}
})();