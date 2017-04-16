 (function() {
 	angular.module('awsServices', [])

 	.service('awsServices', ['$q', 'constants', awsServices]);

 	function awsServices($q, constants){

 		var vm = this;
 		vm.initiateBucket = initiateBucket;
 		vm.upload = upload;
 		vm.remove = remove;
 		vm.edit = edit;
 		vm.getMoments = getMoments;
 		vm.getMomentMetaData = getMomentMetaData;

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
		// // uploadToBestMoments(file, key, metaData);
		// // var key = moment_prefix + file.name;
		s3.upload({
			Key: key,
			Body: file,
			ACL: 'public-read',
			Metadata: metaData
		}, function(err, data) {
			if (err) {
				console.log("FAILURE IN aws_services");
				console.log(err.message);
				deferred.reject();
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
			if(!error) {
				deferred.resolve();
			}
			else {
				console.log("ERROR");
				console.log(error.stack);
				deferred.reject(error);
			}
		})
		return deferred.promise;
	};

	function edit(key, metaData) {
		var deferred = $q.defer();
		var s3 = vm.initiateBucket();
		var params = {
			Bucket: constants.BUCKET_NAME,
			CopySource: constants.BUCKET_NAME + '/' + key,
			Key: key,
			Metadata: metaData,
			MetadataDirective: "REPLACE"
		};

		s3.copyObject(params, function(err, data) {
			if (err) {
  				console.log(err, err.stack); // an error occurred
  				console.log("KEY:");
  				console.log(key);
  				console.log("META:");
  				console.log(metaData);
  				deferred.reject();
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
			if(data) {
				deferred.resolve(data.Metadata);
			}
			else {
				deferred.reject();
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
			if(data) {
				deferred.resolve(data.Contents);
			}
			else {
				console.log("ERROR");
				console.log(error);
				deferred.reject();
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
				console.log(error, error.stack);
				deferred.reject(error);
			}
			else {
				deferred.resolve(data.Body);
			}
		});
		return deferred.promise;
	};
};
})();