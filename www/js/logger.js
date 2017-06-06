		(function() {
			angular.module('logger', [])

			.service('logger', ['$q', 'constants', 'awsServices', logger]);

			function logger($q, constants, awsServices) {
				var vm = this;
				vm.logFile = logFile;
				vm.logReport = logReport;
		/*
			function: What class and function did it fail?  Ex: core.logFile
			parameters: What parameters did it fail with? Ex: {metaData: metaData, key: key}
			error: The error object itself
			key: What kind of error is it?
			*/
			function logFile(failed_function, parameters, error, key) {
				var deferred = $q.defer();
				var key = 'reports/' + key;
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
				return deferred.promise;
			};

			function logReport(report, key) {
				console.log("LOG REPORT");
				var deferred = $q.defer();
				var params = {
					Bucket: constants.BUCKET_NAME,
					Key: key
				}
				uploadLog(Date() + ": " + report, key).then(function() {
					deferred.resolve();
				}, function(error) {
					deferred.reject();
				});
				return deferred.promise;
			};

			function uploadLog(message, key) {
				console.log("LOGGING");
				var moment = {key: key};
				var deferred = $q.defer();
				awsServices.getObject(key).then(function(data) {
					console.log("LOGGER UPLOAD");
					console.log(data);
					data = data.Body;
					message = message + '\r\n\r\n' + data;
					var blob = new Blob([message], {type: "text"});
					var file =  new File([blob], key);
					awsServices.upload(file, moment.key, moment).then(function() {
						deferred.resolve();
					}, function(error) {
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
				console.log("LOG ERROR MESSAGE");
				console.log(error);
				var result = Date() + '\r\n' +
				failed_function + ":\r\n";
				for(var k in parameters) {
					result = result + k + ": " + parameters[k] + "\r\n";
				}
				result = result + error.message;
				return result;
			};
		};
	})();