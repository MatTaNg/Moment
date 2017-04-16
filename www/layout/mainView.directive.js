(function() {
    angular.module('mainview', [])

    .directive('mngMainview', mngMainView)

    function mngMainView() {
      return {
        restrict: 'AE',
        scope: {
            moment: '=' 
        },
        template: '<img src="https://s3.amazonaws.com/mng-moment/test/PA/40.0103647,-75.2625353_1491955135086" height="300px" width="100%"></img>' +
        '{{moment.key}}' +
        '<div class="row row-no-padding">' +
        '<div class="col">' +
        '<div style="text-align: left; margin: 5px; font-size: 18pt">{{moment.location}}</div>' +
        '<div style="text-align: left; margin: 5px; font-size: 12pt">{{moment.time}}</div>' +
        '</div>' +
        '<div ng-show="moment.likes" class="col ion-happy-outline" style="text-align: center; font-size: 32pt">{{moment.likes}}</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        link: function(scope, element, attrs) { 

        }
    };
};
})();