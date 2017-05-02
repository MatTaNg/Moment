 (function() {
 	angular.module('awsServices', [])

 	.service('awsServices', ['$q', 'constants', awsServices]);

 	function awsServices($q, constants){

 		var vm = this;
 		vm.initiateBucket = initiateBucket;
 		vm.upload = upload;
 		vm.remove = remove;
 		vm.copyObject = copyObject;
 		vm.getMoments = getMoments;
 		vm.getMomentMetaData = getMomentMetaData;
 		vm.getObject = getObject;

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

 		function upload(file, key, metaData) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var params = {	
 				Key: key,
 				Body: file,
 				ACL: 'public-read',
 				Metadata: metaData
 			};
 			s3.upload(params, function(error, data) {
 				if(error) {
 					deferred.reject(error);
 				}
 				else {
 					deferred.resolve();
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
 					deferred.reject(error);
 				}
 				else {
 					deferred.resolve();
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
 					deferred.reject(error);
 				}
 				else {
 					deferred.resolve(data.Metadata);
 				}
 			});
 			return deferred.promise;
 		};

 		function getMoments(prefix) {
 			var deferred = $q.defer();
 			var s3 = vm.initiateBucket();
 			var params = {
 				Bucket: constants.BUCKET_NAME,
 				Prefix: prefix
 			};
 			s3.listObjectsV2(params, function(error, data) {
 				if(error) {
 					deferred.reject(error);
 				}
 				else {
 					deferred.resolve(data.Contents);
 				}
 			});
 			return deferred.promise;
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
 					deferred.resolve([]);
 				}
 				else {
 					console.log("RESOLVED");
 					console.log(data);
 					deferred.resolve(data.Metadata);
 				}
 			});
 			return deferred.promise;
 		};
 	};
 })();