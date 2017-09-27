(function() {
  angular.module('multipartUpload', [])

  .service('multipartUpload', ['$q', multipartUpload]);

  function multipartUpload($q){

      var vm = this;
      vm.completeMultipartUpload = completeMultipartUpload;
      vm.uploadPart = uploadPart;
      vm.createMultipartUpload = createMultipartUpload;
      // var fs = require('fs');
      // var AWS = require('aws-sdk');
      // AWS.config.loadFromPath('./aws-config.json');
      var s3 = new AWS.S3();

      // File
      var fileName = '5.pdf';
      var filePath = './' + fileName;
      var fileKey = fileName;
      // var buffer = fs.readFileSync('./' + filePath);
      // S3 Upload options
      var bucket = 'loctest';

      // Upload
      var startTime;
      var partNum = 0;
      var partSize = 1024 * 1024 * 5; // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
      var numPartsLeft = 0
      var maxUploadTries = 3;
      var multipartMap = {
          Parts: []
      };

      function completeMultipartUpload(s3, doneParams) {
        var deferred = $q.defer();
        s3.completeMultipartUpload(doneParams, function(err, data) {
          if (err) {
            console.log("An error occurred while completing the multipart upload");
            console.log(err);
            deferred.reject();
          } else {
            var delta = (new Date() - startTime) / 1000;
            console.log('Completed upload in', delta, 'seconds');
            console.log('Final upload data:', data);
            deferred.resolve();
          }
        });
        return deferred.promise;
      }

      function uploadPart(s3, multipart, partParams, tryNum) {
        console.log("UPLOADING PART...");
        var deferred = $q.defer();
        var tryNum = tryNum || 1;
        s3.uploadPart(partParams, function(multiErr, mData) {
          if (multiErr){
            console.log('multiErr, upload part error:', multiErr);
            if (tryNum < maxUploadTries) {
              console.log('Retrying upload of part: #', partParams.PartNumber)
              return uploadPart(s3, multipart, partParams, tryNum + 1);
            } else {
              console.log('Failed uploading part: #', partParams.PartNumber)
            }
            return;
          }
          multipartMap.Parts[this.request.params.PartNumber - 1] = {
            ETag: mData.ETag,
            PartNumber: Number(this.request.params.PartNumber)
          };
          console.log("Completed part", this.request.params.PartNumber);
          console.log('mData', mData);
          if (--numPartsLeft > 0) deferred.resolve(); // complete only when all parts uploaded

          var doneParams = {
            Bucket: partParams.Bucket,
            Key: partParams.Key,
            MultipartUpload: multipartMap,
            UploadId: multipart.UploadId
          };

          console.log("Completing upload...");
          completeMultipartUpload(s3, doneParams).then(function() {
            deferred.resolve();
          });
        });
        return deferred.promise;
      }

      // Multipart
      function createMultipartUpload(s3, multiPartParams, buffer) {
        partNum = 0;
        startTime = new Date();
        var deferred = $q.defer();
        numPartsLeft = Math.ceil(buffer.byteLength / partSize);

        s3.createMultipartUpload(multiPartParams, function(mpErr, multipart){
          if (mpErr) { console.log('Error!', mpErr); return; }
          console.log("Got upload ID", multipart.UploadId);

          // Grab each partSize chunk and upload it as a part
          var rangeStart = 0;
          async.during(
            function (callback) {
              return callback(null, rangeStart < buffer.byteLength);
            },
            function (callback) {
              rangeStart += partSize;
              console.log("PART ");       
              console.log(rangeStart);
              partNum++;
              var end = Math.min(rangeStart + partSize, buffer.byteLength),
                  partParams = {
                    Body: buffer.slice(rangeStart, end),
                    Bucket: multiPartParams.Bucket,
                    Key: multiPartParams.Key,
                    PartNumber: String(partNum),
                    UploadId: multipart.UploadId
                  };
              // Send a single part
              console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
              uploadPart(s3, multipart, partParams).then(function() {
                deferred.resolve();
              });
              var delta = (new Date() - startTime) / 1000;
              console.log('This part took', delta, 'seconds');
            },
            function (error) {
              if(error) {
                console.log("ERROR");
                console.log(error);
                deferred.reject();
              }
            }
          );
          // for (var rangeStart = 0; rangeStart < buffer.byteLength; rangeStart += partSize) {
          //   // (function(rangeStart) {
          //     console.log("PART ");
          //     console.log(rangeStart);
          //     partNum++;
          //     var end = Math.min(rangeStart + partSize, buffer.byteLength),
          //         partParams = {
          //           Body: buffer.slice(rangeStart, end),
          //           Bucket: multiPartParams.Bucket,
          //           Key: multiPartParams.Key,
          //           PartNumber: String(partNum),
          //           UploadId: multipart.UploadId
          //         };

          //     // Send a single part
          //     console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
          //     uploadPart(s3, multipart, partParams).then(function() {
          //       console.log('1');
          //     });
          //     var delta = (new Date() - startTime) / 1000;
          //     console.log('This part took', delta, 'seconds');
          //     if(rangeStart > buffer.byteLength - partSize) {
          //       deferred.resolve();
          //     }
          //   // }(rangeStart));
          // }
        });
        return deferred.promise;
      }
  };
 })();