(function() {
	angular.module('app.BestMomentsController', [])

	.controller('BestMomentsController', ['$sce', 'core', 'constants', '$stateParams', '$scope', 'components','bestMomentsService', 'localStorageManager', BestMomentsController]);
	function BestMomentsController ($sce, core, constants, $stateParams, $scope, components, bestMomentsService, localStorageManager) {
		var vm = this;
		vm.initialize = initialize;

		vm.moments = localStorageManager.get('bestMoments');
		vm.imageExpanded = false;
		vm.sort = "Likes";
		vm.sortLabel = "Likes";
		vm.loadMore = loadMore;
		vm.createVideogularObj = createVideogularObj;
		vm.stopLoadingData = false;

		if(!vm.moments) {
			vm.moments = [];
		}

		$scope.$watch('vm.sort', function(oldValue, newValue) {
			vm.sortLabel = newValue;
			vm.sort = vm.sort.toLowerCase();
			if(vm.sort === 'likes') {
				vm.sort = '-likes';
			}
		});

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
				vm.stopLoadingData = false;
				$scope.$broadcast('scroll.refreshComplete');
				components.hideLoader().then(function() {
					vm.moments = moments;
				});
			}, function(error) {
				console.log("ERROR");
				vm.noMoments = true;
				console.log(error);
			});
		};
	};
})();