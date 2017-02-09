angular.module('app.momentListSvc', [])

.factory('BlankFactory', [function(){

}])

.service('momentListSvc', [function(){
	var momentArray = [];

	this.getMoment = function() {
		console.log("Get Moment");
		return momentArray;
	};

	this.addMoment = function(key, metaData) {
		console.log("Add Moment");
		momentArray.push({key, metaData});
	};
}]);