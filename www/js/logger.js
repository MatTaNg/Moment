	(function() {
		angular.module('logger', [])

		.service('logger', ['$q', 'constants', logger]);

		function logger($q, constants) {
			var vm = this;
			vm.logFile = logFile;
			vm.logReport = logReport;
			vm.logOutMessage = logOutMessage;
			vm.upload = upload;
			vm.createStackTraceStr = createStackTraceStr;

			function createStackTraceStr(str) {
				
			};

			function upload(file, key) {
				var deferred = $q.defer();
				var albumBucketName = 'mng-moment';
	 			var bucketRegion = 'us-east-1';
	 			var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

	 			AWS.config.update({
	 				region: bucketRegion,
	 				credentials: new AWS.CognitoIdentityCredentials({
	 					IdentityPoolId: IdentityPoolId
	 				})
	 			});

	 			var s3 = new AWS.S3({
	 				apiVersion: '2006-03-01',
	 				params: {Bucket: albumBucketName}
	 			});

	 			var params = {	
	 				Key: key,
	 				Body: file,
	 				ACL: 'public-read',
	 				ContentType: 'text/plain'
	 			};

	 			s3.upload(params, function(error, data) {
	 				if(error) {
	 					logOutMessage("logger.upload", parameters, error);
	 					deferred.reject();
	 				}
	 				else {
	 					deferred.resolve();
	 				}
	 			});
	 			return deferred.promise;
				};

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

			function logOutMessage(failed_function, parameters, error) {
				console.log("============================================");
				console.log("ERROR in " + JSON.stringify(failed_function));
				console.log("Parameters:");
				console.log(JSON.stringify(parameters, null, 4));
				console.log(error);
				console.log("============================================");
			}
		/*
			function: What class and function did it fail?  Ex: core.logFile
			parameters: What parameters did it fail with? Ex: {metaData: metaData, key: key}
			error: The error object itself
			key: What kind of error is it?
			*/
			function logFile(failed_function, parameters, error, key) {
				var key = 'reports/' + key;
				logOutMessage(failed_function, parameters, error);
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
					return uploadLog(msg, key);
				} else {
					return uploadLog("File does not exist", key);
				}
			};

			function logReport(report, moment, key) {
				if(key.indexOf("reports") === -1) {
					key = 'reports/' + key;
				}
				var params = {
					Bucket: constants.BUCKET_NAME,
					Key: key
				}
				if(fileExists(key)){
					return uploadLog(Date() + ": " + report + '\r\n\r\n' + convertMetaDataToString(moment), key);
				} else {
					return uploadLog("File does not exist", key);
				}
			};

			function uploadLog(message, key) {
				var deferred = $q.defer();
				key = key.replace('.txt', '');
				var moment = {key: key};
				var date = new Date().getMonth() + "-" + new Date().getDate() + "-" +
				new Date().getHours() + "Hr" + new Date().getMinutes() + "Min" + new Date().getSeconds() + "Sec";
				moment.key = moment.key + "/" + date + ".txt";
				var blob = new Blob([message], {type: "text"});
				return upload(blob, moment.key);

			};

			function createLogMessage(failed_function, parameters, error, key) {
				var result = Date() + '\r\n' +
				failed_function + ":\r\n";
				for(var k in parameters) {
					result = result + k + ": " + JSON.stringify(parameters[k]) + "\r\n";
				}
				result = result + error.message;
				return result;
			};
	};

	function uintToString(uintArray) {
var encodedString = String.fromCharCode.apply(null, uintArray),
    decodedString = decodeURIComponent(escape(encodedString));
return decodedString;
}
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