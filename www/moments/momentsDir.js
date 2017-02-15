angular.module('app.momentDir', [])

.directive('mngDescription', function($timeout) {
  return {
    restrict: 'EA',
    template: '<div ng-if="currentImage.description" ng-click="toggleDescription()">' +
    '<div class="row">' +
    '<div class="col"><p ng-class="moment.toggleDescription" style="font-size:12pt;">{{currentImage.description}}</p></div>' +
    '</div>' +
    '<div ng-show = "showHR" style="width: 100%; height: 10px; border-bottom: 1px solid black; text-align: center">' +
    '<span style="font-size: 12px; background-color: #FFF; margin-bottom: 5px">' +
    '<span ng-show="moment.toggleDescription === \'contracted\'">Show More </span>' +
    '<span ng-show="moment.toggleDescription === \'expanded\'">Show Less </span>' +
    '</span>' +
    '</div>' +
    '</div>',
    link: function(scope, element, attrs) {
      scope.$watch('description', function( newValue, oldValue) {
        if(newValue)
          $timeout(
            function() {
              if(element[0].offsetHeight > 60) {
                scope.showHR = true;
                scope.moment.toggleDescription = 'contracted';
              }
              else {
                scope.showHR = false;
                scope.moment.toggleDescription = 'expanded';
              }
            }
              , 0);
      });
      
    }
  };
});