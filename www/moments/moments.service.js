(function() {
	angular.module('app.momentsService', [])

	.service('momentsService', ['common', 'core', '$q', 'constants', 'logger', 'geolocation', 'awsServices', 'localStorageManager', 'commentManager', momentsService]);

	function momentsService(common, core, $q, constants, logger, geolocation, awsService, localStorageManager, commentManager){
		var that = this;

		localStorageManager.getAndDownload('moments').then(function(moments) {
			this.momentArray = moments;
		})

		this.initializeView = initializeView;
		this.updateMoment = updateMoment;
		this.uploadReport = uploadReport;
		this.addExtraClassesandSetTime = addExtraClassesandSetTime;
		this.setMomentArray = setMomentArray;
		this.getStartAfterKey = getStartAfterKey;
		this.removeMomentFromLocalStorage = removeMomentFromLocalStorage;
		
		//Helper Functions
		this.checkAndDeleteExpiredMoments = checkAndDeleteExpiredMoments;
		this.deleteOrUploadToBestMoments = deleteOrUploadToBestMoments;
		this.updateMomentMetaDataForUpload = updateMomentMetaDataForUpload;
		this.didUserDoTutorial = didUserDoTutorial;

		var startAfterKey = "";

		if(!this.momentArray) {
			this.momentArray = [];
		}

		function getStartAfterKey() {
			return startAfterKey;
		};

		function setMomentArray(moments) {
			this.momentArray = moments;
		};

		function removeMomentsWithUsersUUID(moments) {
			for(var i = 0; i < moments.length; i) {
				if(moments[i].uuids.split(" ").indexOf(common.getUUID()) !== -1) {
					moments.splice(i, 1);
				} else {
					i++;
				}
			}
		};

		function initializeView() {
			var deferred = $q.defer();
			var checkAndDeleteExpiredMoments = this.checkAndDeleteExpiredMoments;
			var deleteOrUploadToBestMoments = this.deleteOrUploadToBestMoments;
			var temp = this.momentArray;
			didUserDoTutorial().then(function(data) {
				this.momentArray = temp;
				if(!data) {
					geolocation.getMomentsAroundUser(startAfterKey)
					.then(checkAndDeleteExpiredMoments)
					.then(deleteOrUploadToBestMoments)
					.then(commentManager.retrieveCommentsAndAddToMoments)
					.then(function(moments) {
						if(moments.length > 0) {
							var uniqueKey = moments[moments.length - 1].key.split("/");
							startAfterKey = 'moment/' + uniqueKey[uniqueKey.length - 2] + "/" + uniqueKey[uniqueKey.length - 1];
						} else {
							startAfterKey = ""; //This tells the controller to stop calling initialize
						}
						removeMomentsWithUsersUUID(moments);
						core.didUserChangeRadius = false;
						if(moments.length > 0) {
							localStorageManager.addandDownload('moments', moments).then(function() {
								deferred.resolve(moments);			
							});
						}
						else {
							deferred.resolve(moments);
						}
					}, function(error) {
						console.log("ERROR");
						console.log(error);
						deferred.reject(error);
					});
				}
				else {
					deferred.resolve(data);
				}
			});
			return deferred.promise;
		};

		function didUserDoTutorial() {
			var prefix = constants.MOMENT_PREFIX + 'tutorial';
			return core.listMoments(prefix).then(function(data) {
				var counter = 0;
				var temp = data;
				for(var i = 0; i < data.length; i++ ){
					var uuids = data[i].uuids.split(" ");
					if(uuids.indexOf(common.getUUID()) === -1) {
						counter++;
					}
				}
				return counter === 3 ? data : false;
			});
		};

		function uploadReport(report, moment) {
			var defered = $q.defer();
			logger.logReport(report, moment, 'flagged.txt').then(function() {
				defered.resolve();
			}, function(error) {
				defered.reject(error);
			}); 
			return defered.promise;
		};

		function updateMoment(liked) {
			var temp = createTempVariable(this.momentArray);
			var updatedMoment = temp[0];
			updatedMoment = that.updateMomentMetaDataForUpload(updatedMoment, liked);
			localStorageManager.set('moments', this.momentArray);
			return core.edit(updatedMoment);
		};

//Helper functions

function updateMomentMetaDataForUpload(moment, liked) {
	var temp = createTempVariable(moment);
	var views = (parseInt(moment.views) + 1).toString();
	moment.views = views;
	if(liked) {
		var likes = parseInt(moment.likes) + 1;
		moment.likes = likes.toString();
	}
	moment.uuids = moment.uuids + " " + common.getUUID();
	moment.time = new Date().getTime() - parseInt(common.timeElapsed(moment.time));
	moment.time = moment.time.toString();
	delete moment.comments;
	return moment;
};

//In order to upload to best moments the likes / views need to be more than the 'BEST_MOMENTS_RATIO' it also needs a minimum amount of views
function deleteOrUploadToBestMoments(moments) {
	var deferred = $q.defer();
	if(moments.length === 0) {
		deferred.resolve(moments);
	}
	var tempMoments = createTempVariable(moments);
	async.each(tempMoments, function(moment, callback) {
		if(parseInt(moment.views) > constants.BEST_MOMENTS_MIN_VIEWS) {
				if(parseInt(moment.likes) / parseInt(moment.views) > constants.BEST_MOMENTS_RATIO) {
					common.uploadToBestMoments(createTempVariable(moment));
			} 
			//Remove Best Moment - We divide by 2; otherwise this will run everytime a moment is above the min views mark and does not belong in bestMoments - Which will be almost every time.
			else if(parseInt(moment.likes) / parseInt(moment.views) > constants.BEST_MOMENTS_RATIO / 2) {
				common.removeFromBestMoments(moment);
			}
		}
		callback();
	}, function(error) {
		if(error) {
			deferred.reject();
		}
		deferred.resolve(moments);
	});
	return deferred.promise;
};

function checkAndDeleteExpiredMoments(moments) {
	console.log("CHECK AND DELETE checkAndDeleteExpiredMoments");
	console.log(moments);
	var deferred = $q.defer();
	var tempMoments = createTempVariable(moments);
	currentTime = new Date().getTime(),
	timeBetweenMoments = constants.MILISECONDS_IN_AN_HOUR * constants.HOURS_UNTIL_MOMENT_EXPIRES;
	if(moments.length === 0) {
		deferred.resolve(moments);
	}
	async.each(moments, function(moment, callback) {
		var extraTimeFromLikes = parseInt(moment.likes) * constants.EXTRA_TIME_LIKES_GIVES_MOMENTS_MULTIPLIER;
		// timeElapsed = core.timeElapsed(moment.time);
		if(currentTime - moment.time > timeBetweenMoments + extraTimeFromLikes) {
			if(localStorageManager.get('moments')) {
				removeMomentFromLocalStorage(moment);
			}
			core.remove(moment);
			tempMoments.splice(tempMoments.indexOf(moment), 1);
		}
		// moment.time = core.timeElapsed(moment.time);
		callback();
	}, function(error) {
		moments = tempMoments;
		if(error) {
			deferred.reject();
		}
		deferred.resolve(moments);
	});
	return deferred.promise;
};

function addExtraClassesandSetTime(moments) {
	for(var i = 0; i < moments.length; i++) {
		if(i === 0) {
			moments[0].class = "layer-top";
			moments[0].animate = "invisible";
			moments[0].showComments = "true";
			moments[0].time = common.timeElapsed(moments[0].time);
		}
		else if(i === 1) {
			moments[1].class = "layer-next";
			moments[1].animate = "invisible";
			moments[1].time = common.timeElapsed(moments[1].time);
		}
		else {
			moments[i].class = "layer-hide";
			moments[i].animate = "invisible";
			moments[i].time = common.timeElapsed(moments[i].time); 
		}
	}
	
	
	return moments;
};

function getMomentsOnlyWithinRadius(moments){
	var momentsInStates = [];
	for(var i = 0; i < moments.length; i++) {
		if(geolocation.isMomentWithRadius(moments[i].Key)) { //The first key listed is always the folder, skip that.
			momentsInStates.push(moments[i]);
		}
	}
	return momentsInStates;
};

function removeMomentFromLocalStorage(moment) {
	localStorageManager.remove('moments', moment);
};

function createTempVariable(moments) {
	var temp = [];
	for(var i = 0; i < moments.length; i++) {
		temp.push(common.populateMomentObj(moments[i]));
	}
	if(temp.length === 0) {
		return moments;
	}
	return temp;
};

	};
})();