angular.module('app.cameraSvc', [])

.factory('BlankFactory', [function(){

}])

.service('upload-to-AWS', [function(file){
	// const apiVersion = {apiVersion: '2006-03-01'};
	// const bucketName = 'mattangsbucket';
	// const accessKey = 'AKIAJBAEL7EVUGTLAETQ'; //Probably not good

	// var s3 = new AWS.S3(apiVersion);
	// s3.abortMultipartUpload(params, function (err, data) {
	// if (!err) {
	//    console.log(data);           // successful response

	//    var params = {Bucket: bucketName, Key: accessKey, Body: file};
	//    s3.upload(params, function(err, data) {
	//    	console.log(err, data);
	//    });
	// }
	// else    
	//   	console.log(err, err.stack); // an error occurred
	// });

}])