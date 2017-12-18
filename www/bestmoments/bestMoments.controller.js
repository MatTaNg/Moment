(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$scope', 'core', 'components','bestMomentsService', 'localStorageManager', 'constants', BestMomentsController]);
	function BestMomentsController ($scope, core, components, bestMomentsService, localStorageManager, constants) {
		var vm = this;
		vm.initialize = initialize;
		vm.moments = localStorageManager.get('bestMoments');
		vm.loadMore = loadMore;
		vm.createVideogularObj = createVideogularObj;
		vm.sortMoments = sortMoments;

		vm.imageExpanded = false;
		vm.stopLoadingData = false;

		if(!vm.moments) {
			vm.moments = [];
		}

		if(vm.moments.length === 0) {
			bestMomentsService.initializeView().then(function(moments) {
				createVideogularObj(moments);
				components.hideLoader();
				vm.moments = moments;
			}); 
		}
		else {
			vm.moments = bestMomentsService.convertTime(vm.moments);
			createVideogularObj(vm.moments);
			loadMore();
		}

		vm.initialize();

		function createVideogularObj(moments) {
			var sources_array = [];
			for(var i = 0; i < moments.length; i++) {
				if(moments[i].media === "video") {
					sources_array.push( {src: moments[i].nativeURL, type: "video/mp4"} );
				}
			}
			vm.config = {
		        sources: sources_array,
		        tracks: [
		          {
		            src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
		            kind: "subtitles",
		            srclang: "en",
		            label: "English",
		            default: ""
		          }
		        ],
		        theme: "lib/videogular-themes-default/videogular.css",
		        plugins: {
		          poster: "http://www.videogular.com/assets/images/videogular.png"
		        }
		      };
		};

		function loadMore() {
			bestMomentsService.loadMore().then(function(moments) {
				if(moments.length === 0) {
					vm.stopLoadingData = true;
				}
				createVideogularObj(moments);
				bestMomentsService.momentArray = bestMomentsService.momentArray.concat(moments);
				vm.moments = vm.moments.concat(moments);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, function(error) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			})
		};

		function initialize() {
			bestMomentsService.initializeView()
			.then(function(moments){
				vm.sortMoments(moments);
				vm.stopLoadingData = false;
				$scope.$broadcast('scroll.refreshComplete');
				components.hideLoader().then(function() {
					vm.moments = moments;
				});
			}, function(error) {
				vm.noMoments = true;
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		function sortMoments(moments) {
			for(var i = 0; i < moments.length; i++) {
				moments[i].rank = new Date().getTime() - moments[i].time;
				moments[i].rank = moments[i].rank / constants.MILISECONDS_IN_A_DAY;
				moments[i].rank = moments[i].likes - moments[i].rank;
				if(moments[i].rank < 0) {
					core.remove(moments[i]);
				}
			}
		};
	};
})();