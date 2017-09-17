		(function() {
			angular.module('logger', [])

			.service('logger', ['$q', 'constants', 'awsServices', logger]);

			function logger($q, constants, awsServices) {
				var vm = this;
				vm.logFile = logFile;
				vm.logReport = logReport;

				//Prevents any new log files from being created due to typos and whatnot
				function fileExists(key) {
					if(key.startsWith('reports/') &&
						constants.REPORT_FILES.indexOf(key.split('/')[1] !== -1)) {
						return true;
					} else {
						return false;
					}
				};

				function convertMetaDataToString(metaData) {
					if(metaData.key) {
						return "KEY: " + metaData.key + '\r\n\r\n' +
								"LIKES: " + metaData.likes + '\r\n\r\n' +
								"LOCATION: " + metaData.location + '\r\n\r\n' +
								"TIME: " + metaData.time + '\r\n\r\n' +
								"UUIDS: " + metaData.uuids;
						}
						else {
							return "";
						}
				};
		/*
			function: What class and function did it fail?  Ex: core.logFile
			parameters: What parameters did it fail with? Ex: {metaData: metaData, key: key}
			error: The error object itself
			key: What kind of error is it?
			*/
			function logFile(failed_function, parameters, error, key) {
				var deferred = $q.defer();
				var key = 'reports/' + key;
				if(parameters.MetaData) {
					parameters.MetaData = convertMetaDataToString(parameters.MetaData);
				}
				if(fileExists(key)) {
					var msg = createLogMessage(failed_function, parameters, error, key);
					var moment = {key: key};
					var params = {
						Bucket: constants.BUCKET_NAME,
						Key: key
					};
					uploadLog(msg, key).then(function() {
						deferred.resolve();
					}, function(error) {
						deferred.reject(error);
					});
				} else {
					uploadLog("File does not exist", key).then(function() {
						deferred.reject();
					});
				}
				return deferred.promise;
			};

			function logReport(report, moment, key) {
				if(key.indexOf("reports") === -1) {
					key = 'reports/' + key;
				}
				var deferred = $q.defer();
				var params = {
					Bucket: constants.BUCKET_NAME,
					Key: key
				}
				if(fileExists(key)){
					uploadLog(Date() + ": " + report + '\r\n\r\n' + convertMetaDataToString(moment), key).then(function() {
						deferred.resolve();
					}, function(error) {
						deferred.reject();
					});
				} else {
					uploadLog("File does not exist", key).then(function() {
						deferred.reject();
					});
				}
				return deferred.promise;
			};

			function uploadLog(message, key) {
				console.log("UPLOAD LOG");
				console.log(message);
				console.log(key);
				var moment = {key: key};
				var deferred = $q.defer();
				awsServices.getObject(key).then(function(data) {
					console.log("NEW MESSAGE");
					console.log(data);
					data =  data.Body.toString('ascii');
					// data = new TextDecoder("utf-8").decode(data.Body);
					// data = Utf8ArrayToStr(data.Body);
					console.log(data);
					console.log(message);
					newMessage = message.toString() + '\r\n\r\n' + data;
					var blob = new Blob([newMessage.toString()], {type: "text"});
					var file =  new File([blob], key);
					awsServices.upload(file, moment.key, moment).then(function() {
						deferred.resolve();
					}, function(error) {
						console.log("UPLOAD LOG REJECT");
						deferred.reject();
					});
				}, function(error) {
					console.log("ERROR");
					console.log(error);
					deferred.reject();
				});
				return deferred.promise;
			};

			function createLogMessage(failed_function, parameters, error, key) {
				var result = Date() + '\r\n' +
				failed_function + ":\r\n";
				for(var k in parameters) {
					result = result + k + ": " + parameters[k] + "\r\n";
				}
				result = result + error.message;
				return result;
			};
		};
	function Utf8ArrayToStr(array) {
	    var out, i, len, c;
	    var char2, char3;

	    out = "";
	    len = array.length;
	    i = 0;
	    while(i < len) {
	    c = array[i++];
	    switch(c >> 4)
	    { 
	      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	        // 0xxxxxxx
	        out += String.fromCharCode(c);
	        break;
	      case 12: case 13:
	        // 110x xxxx   10xx xxxx
	        char2 = array[i++];
	        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	        break;
	      case 14:
	        // 1110 xxxx  10xx xxxx  10xx xxxx
	        char2 = array[i++];
	        char3 = array[i++];
	        out += String.fromCharCode(((c & 0x0F) << 12) |
	                       ((char2 & 0x3F) << 6) |
	                       ((char3 & 0x3F) << 0));
	        break;
	    }
	    }

	    return out;
	}
	})();