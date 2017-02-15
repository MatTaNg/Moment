angular.module('app.myMomentsSvc', [])

.service('myMomentsSvc', ['coreSvc',
	function (coreSvc) {
		this.removeFromLocalStorage = function(location) {
			var localMoments = JSON.parse(localStorage.getItem('myMoments'));
			localMoments.splice(localMoments.findIndex(findMoment), 1);
			localStorage.setItem('myMoments', JSON.stringify(localMoments));
		};

		function findMoment(moment) {
			return moment.location === 'Narberth, PA';
		};

		var createKey = function(isBug) {
			if(!isBug) {
				return 'reports/feedback.txt';
			}
			else {
				return 'reports/bugs.txt';
			}
		};

		this.uploadFeedback = function(feedback, isBug) {
			var s3 = coreSvc.initiateBucket();
			var key = createKey(isBug);
			var params = {
				Bucket: coreSvc.getBucketName(),
				Key: key
			};
			s3.getObject(params, function(error, data) {
				if(error) {
					console.log(error, error.stack);
				}
				else {
					feedback = data.Body.toString() + "\r\n" + feedback;
					var blob = new Blob([feedback], {type: "text"});
					var file =  new File([blob], key);
					coreSvc.upload(file, key, {});
				}
			});

		};
	}])
