angular
    .module('blocks.exception')
    .config(exceptionConfig);

exceptionConfig.$inject = ['$provide'];

function exceptionConfig($provide) {
    $provide.decorator('$exceptionHandler', extendExceptionHandler);
}

extendExceptionHandler.$inject = ['$delegate', 'toastr', 'core'];

function extendExceptionHandler($delegate, toastr, core) {
    return function(exception, cause) {
        $delegate(exception, cause);
        var errorData = {
            exception: exception,
            cause: cause
        };
        core.logFile(exception.msg + " | " + errorData, "errors.txt");
        /**
         * Could add the error to a service's collection,
         * add errors to $rootScope, log errors to remote web server,
         * or log locally. Or throw hard. It is entirely up to you.
         * throw exception;
         */
        // toastr.error(exception.msg, errorData);
    };
}

  var handlingRouteChangeError = false;

  function handleRoutingErrors() {
    /**
     * Route cancellation:
     * On routing error, go to the dashboard.
     * Provide an exit clause if it tries to do it twice.
     */
     $rootScope.$on('$routeChangeError',
      function(event, current, previous, rejection) {
        if (handlingRouteChangeError) { return; }
        handlingRouteChangeError = true;
        $ionicContentBanner.show({
          text: ["Your description is too long."],
          autoClose: 3000,
          type: 'error'
        });
        var destination = (current && (current.title ||
          current.name || current.loadedTemplateUrl)) ||
        'unknown target';
        var msg = 'Error routing to ' + destination + '. ' +
        (rejection.msg || '' + "Current: " + current);
        core.logFile(msg, errors.txt).then(function() {
          $state.go('tabsController.moments');
        });
      }
      );
   };