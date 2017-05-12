(function() {
    angular.module('app.momentsDirective', [])

    .directive('mngDescription', mngMainView)

    function mngMainView() {
      return {
        restrict: 'AE',
        scope: {
            moment: '=' 
        },
        template: '<img src="{{moment.key}}" height="80%" width="100%"></img>' +
        '<div class="row row-no-padding">' +
        '<div class="col">' +
        '<div class="momentLocation">{{moment.location}}</div>' +
        '<div class="ion-ios-clock-outline momentTime">{{moment.time}}</div>' +
        '</div>' +
        '<img src="img/logo.png" width=45px height=45px style="margin-right: 10px"></img>' +
        '<div ng-show="moment.likes" class="momentLikes">{{moment.likes}}</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        link: function(scope, element, attrs) { 

        }
    };
};
})();