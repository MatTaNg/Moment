(function() {
  angular.module('app.momentsDirective', [])

  .directive('mngDescription', momentDirective);

  function momentDirective($timeout) {
    return {
      restrict: 'E',
      bindToController:true,
      // controller: 'MomentsController',
      // controllerAs: 'vm',
      template: '<div ng-if="vm.currentImage.description" ng-click="vm.toggleDescription()">' +
      '<div class="row">' +
      '<div class="col"><p ng-class="vm.moment.toggleDescription" style="font-size:12pt;">{{vm.currentImage.description}}</p></div>' +
      '</div>' +
      '<div ng-show = "showHR" style="width: 100%; height: 10px; border-bottom: 1px solid black; text-align: center">' +
      '<span style="font-size: 12px; background-color: #FFF; margin-bottom: 5px">' +
      '<span ng-show="vm.moment.toggleDescription === \'contracted\'">Show More </span>' +
      '<span ng-show="vm.moment.toggleDescription === \'expanded\'">Show Less </span>' +
      '</span>' +
      '</div>' +
      '</div>',
      link: function(scope, element, attrs) {
        scope.$watch('vm.currentImage.description', function( newValue, oldValue) {
          if(newValue) {
            $timeout(
              function() {
                if(element[0].offsetHeight > 60) {
                  scope.showHR = true;
                  scope.vm.moment.toggleDescription = 'contracted';
                }
                else {
                  scope.showHR = false;
                  scope.vm.moment.toggleDescription = 'expanded';
                }
              }

              , 1000);
          }
        });

      }
    };
  };
})();