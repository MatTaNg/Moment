 (function() {
 	angular.module('awsServices', [])

 	.service('awsServices', ['$q', 'constants', 'logger', 'multipartUpload', awsServices]);

 	function awsServices($q, constants, logger, multipartUpload){

 		var vm = this;
 		vm.initiateBucket = initiateBucket;
 		vm.upload = upload;
 		vm.remove = remove;
 		vm.copyObject = copyObject;
 		vm.getMoments = getMoments;
 		vm.getMomentMetaData = getMomentMetaData;
 		vm.getObject = getObject;
 		vm.multiPartUpload = multiPartUpload;

 		function initiateBucket() {
 			var albumBucketName = 'mng-moment';
 			var bucketRegion = 'us-east-1';
 			var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

 			AWS.config.update({
 				region: bucketRegion,
 				credentials: new AWS.CognitoIdentityCredentials({
 					IdentityPoolId: IdentityPoolId
 				})
 			});

 			return new AWS.S3({
 				apiVersion: '2006-03-01',
 				params: {Bucket: albumBucketName}
 			});
 		};

 		function multiPartUpload(buffer, key, metaData) {
 			var deferred = $q.defer();
	      var multiPartParams = {
		      Bucket: constants.BUCKET_NAME,
		      Key: key,
		      ContentType: 'video/mp4',
		      Metadata: metaData
		  };
		  multipartUpload.createMultipartUpload(initiateBucket(), multiPartParams, buffer).then(function() {
		  	deferred.resolve();
		  });
 			return deferred.promise;
 		};

 		function upload(file, key, metaData) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var contentType;
 			if(key.indexOf("reports") !== -1) {
 				contentType = "text/plain";
 			}
 			else {
 				if(metaData.media === "video") {
 					contentType = "video/mp4";
 				} else {
	 				contentType = "image/jpg";
 				}
 			}
 			var params = {	
 				Key: key,
 				Body: file,
 				ACL: 'public-read',
 				Metadata: metaData,
 				ContentType: contentType
 			};
 			s3.upload(params, function(error, data) {
 				if(error) {
 					parameters = {
 						file: file,
 						key: key,
 						metaData: metaData
 					};
					logger.logFile("aws_services.upload", parameters, error, 'error,txt');
					deferred.reject(error);	
 				}
 				else {
 					console.log("UPLOAD SUCCESS");
 					console.log(data);
 					deferred.resolve(data);
 				}
 			});
 			return deferred.promise;
 		};

 		function remove(path){
 			var deferred = $q.defer();
 			var params = {
 				Bucket: constants.BUCKET_NAME,
 				Key: path
 			};
 			var s3 = vm.initiateBucket();
 			s3.deleteObject(params, function(error, data) {
 				if(error) {
 					parameters = {
 						path: path
 					};
					logger.logFile("aws_services.remove", parameters, error, 'errors.txt');
					deferred.reject(error);	
 				}
 				else {
 					deferred.resolve();
 				}
 			});
 			return deferred.promise;
 		};

 		function copyObject(key, copySource, metaData, directive) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var params = {
 				Bucket: constants.BUCKET_NAME,
 				CopySource: constants.BUCKET_NAME + '/' + copySource,
 				Key: key,
 				Metadata: metaData,
 				MetadataDirective: directive
 			};
 			s3.copyObject(params, function(error, data) {
 				if(error) {
 					parameters = {
 						key: key,
 						copySource: copySource,
 						metaData: metaData,
 						directive: directive,
 					};
 					logger.logFile("aws_services.copyObject", parameters, error, 'error.txt');
					// logger.logFile("aws_services.copyObject", parameters, error, 'errors.txt');
					deferred.reject(error);	
 				}
 				else {
 					getMomentMetaData(key).then(function(metaData) {
 						deferred.resolve();
 					});
 					
 				}
 			});
 			return deferred.promise;
 		};

 		function getMomentMetaData(key) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var params = {
 				Bucket: constants.BUCKET_NAME,
 				Key: key
 			};
 			s3.headObject(params, function(error, data) {
 				if(error) {
 					parameters = {
 						key: key
 					};
 					logger.logOutMessage("aws_services.getMomentMetaData", parameters, error);
					// logger.logFile("aws_services.getMomentMetaData", parameters, error, 'errors.txt');
					deferred.reject(error);	
 				}
 				else {
 					deferred.resolve(data.Metadata);
 				}
 			});
 			return deferred.promise;
 		};

 		function getMoments(prefix, startAfter) {
 			var deferred = $q.defer();
 			var startAfter = startAfter;
 			var s3 = vm.initiateBucket();
 			var params = {
 				MaxKeys: constants.MAX_MOMENTS_PER_GET,
 				Bucket: constants.BUCKET_NAME,
 				Prefix: prefix,
 				StartAfter: prefix //Prevent AWS from returning the directory
 			};
 			if(startAfter !== '' || undefined) {
 				params.StartAfter = startAfter;
 			}
 			s3.listObjectsV2(params, function(error, data) {
 				if(error) {
 					parameters = {
 						prefix: prefix,
 						startAfter: startAfter
 					};
					// logger.logFile("aws_services.getMoments", parameters, error, 'errors.txt');
					logger.logFile("aws_services.getMoments", parameters, error, 'error.txt');
					deferred.reject(error);	
 				}
 				else {
 					deferred.resolve(data.Contents);
 				}
 			});
 			return deferred.promise;
 		};

 		function getMoment(moment) {
			return awsServices.getObject(moment.key);
		};

 		function getObject(key) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var params = {
 				Bucket: constants.BUCKET_NAME,
 				Key: key
 			};
 			s3.getObject(params, function(error, data) {
 				if(error) {
					deferred.resolve("Not Found");	
 				}
 				else {
 					deferred.resolve(data);
 				}
 			});
 			return deferred.promise;
 		};
 	};
 })();