(function(module) {
    module.config(function ($provide) {

        $provide.decorator("$exceptionhandler", function($delegate, $injector) { //$delegate is the exceptionHandler service $injector allows us to avoid the Circular dependency error
            return function (exception, cause) { //Our function must return the same function in the $exceptionHandler documentation
                $delegate(exception, cause); //Basically reads $exceptionhandler(exception, cause) which allows angular to do whatever it needs to do.
            };
            //Here is where we do what we want to do with the exceptionhandler
            
            var logger = $injector.get("logger"); //Use the injector to get our alerting service (alerting is our own ommitted AngularJS service).
            logger.logFile("EXCEPTION HANDLER", {}, {}, "error.txt");
            });

        $provide.decorator("$interpolate", function($delegate, $log){
                var serviceWrapper = function() {
                    var bindingFunction = $delegate.apply(this, arguments); //Apply will invoke the original service, this is our context and arguments is a variable in every JS object which represents all its functions
                    if(angular.isFunction(bindingFunction) && arguments[0]) { //arguments[0] will be the expression itself
                        return bindingWrapper(bindingFunction, arguments[0].trim());
                    }
                    return bindingFunction;
                };

                var bindingWrapper = function(bindingFunction, bindingExpression) {
                    return function() {
                        var result = bindingFunction.apply(this, arguments); //Result will be the result which is displayed on the screen
                        console.log(result.trim());
                        return result;
                    };
                };

                angular.extend(serviceWrapper, $deletegate); //Angular adds special properties to interpolate.  We copy these properties to our object so it looks just like it.
                return serviceWrapper;
            }); //Any binding expression we have, Angular uses the interpolate service to parse that expression when it needs to update the DOM

        });
});
