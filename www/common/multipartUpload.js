  // //Taken from: https://gist.github.com/sevastos/5804803

(function() {
  angular.module('multipartUpload', [])

  .service('multipartUpload', ['$q', 'logger', '$cordovaFileTransfer', multipartUpload]);

  function multipartUpload($q, logger, $cordovaFileTransfer){

    var vm = this;
    vm.completeMultipartUpload = completeMultipartUpload;
    vm.uploadPart = uploadPart;
    vm.createMultipartUpload = createMultipartUpload;

      // Upload
      var startTime;
      var partNum = 0;
      var partSize = 1024 * 1024 * 5; // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
      var numPartsLeft = 0
      var maxUploadTries = 3;
      var multipartMap = {
        Parts: []
      };

      function downloadFile_saveToLocalStorage(metaData) {
        $cordovaFileTransfer.download(metaData.key,
          cordova.file.externalDataDirectory + 'moments',
          {}, true).then(function(result) {
            metaData.nativeurl = result.nativeURL;
            
            var currentLocalStorage = [];
            if(JSON.parse(localStorage.getItem('myMoments'))) {
              currentLocalStorage = JSON.parse(localStorage.getItem('myMoments'));
            }
            currentLocalStorage.push(metaData);
            localStorage.setItem('myMoments', JSON.stringify(currentLocalStorage));
            console.log("MULTIPART UPLOAD FINISHED"); //Required for manual testing
          }, function(error) {
            console.log("ERROR");
            console.log(error);
            var parameters = {
              metaData: metaData
            }
            logger.logFile("core.downloadFiles", parameters, error, 'errors.txt');
          });
        };

        function completeMultipartUpload(s3, doneParams, metaData) {
          console.log("COMPLETED MULTIPART UPLOAD");
          s3.completeMultipartUpload(doneParams, function(err, data) {
            if (err) {
              console.log("An error occurred while completing the multipart upload");
              console.log(err);
            } else {
              var delta = (new Date() - startTime) / 1000;
              console.log('Completed upload in', delta, 'seconds');
              console.log('Final upload data:', data);
              downloadFile_saveToLocalStorage(metaData);
          }
        });
        }

        function uploadPart(s3, multipart, partParams, metaData) {
          console.log("UPLOAD PART");
          var tryNum = tryNum || 1;
            s3.uploadPart(partParams, function(multiErr, mData) {
              console.log("Uplaod Part Complete");
              console.log(mData);
            if (multiErr){
              console.log('multiErr, upload part error:', multiErr);
              if (tryNum < maxUploadTries) {
                console.log('Retrying upload of part: #', partParams.PartNumber)
                uploadPart(s3, multipart, partParams, tryNum + 1);
              } else {
                console.log('Failed uploading part: #', partParams.PartNumber)
              }
              return;
            }
            multipartMap.Parts[this.request.params.PartNumber - 1] = {
              ETag: mData.ETag,
              PartNumber: Number(this.request.params.PartNumber)
            };
            if (--numPartsLeft > 0) return; // complete only when all parts uploaded

            var doneParams = {
              Bucket: partParams.Bucket,
              Key: partParams.Key,
              MultipartUpload: multipartMap,
              UploadId: multipart.UploadId
            };

            completeMultipartUpload(s3, doneParams, metaData);
          });
      }

      // Multipart
      function createMultipartUpload(s3, multiPartParams, buffer) {
        var deferred = $q.defer();
        var parts = 0;
        var partsComplete = 0;
        var rangeStart = 0;
        partNum = 0;
        startTime = new Date();
        numPartsLeft = Math.ceil(buffer.byteLength / partSize);
        console.log("Initial Size: ", buffer.byteLength);
        s3.createMultipartUpload(multiPartParams, function(mpErr, multipart){
          if (mpErr) { console.log('Error!', mpErr); return; }
          console.log("Got upload ID", multipart.UploadId);

          async.whilst(  
            function () {
              return rangeStart < buffer.byteLength;
            },
            function (callback) {
              parts++;
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
              uploadPart(s3, multipart, partParams, multiPartParams.Metadata);
              var delta = (new Date() - startTime) / 1000;
              console.log('This part took', delta, 'seconds');
              rangeStart += partSize;              
              callback(null, rangeStart);
            },
            function (error) {
              if(error) {
                console.log("ERROR");
                console.log(error);
              }
              deferred.resolve();
            }
            );
      });
return deferred.promise;
};
};
})();