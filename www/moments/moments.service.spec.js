describe('Moment Service', function() {
	var service_Mock, core_Mock,
	momentArray_Mock = [1, 2, 3, 4, 5];

	beforeEach(function() {
		// var deferred = $q.defer();

		module(function($provide) {
			// $provide.service('core', function() {
			// 	this.initializeView = jasmine.createSpy('initializeView spy')
			// 	.and.return(deferred.promise);
			// });
		$provide.service('core', function() {
			this.getUUID = jasmine.createSpy('getUUID spy')
			.and.return(123);
		});
		$provide.service('core', function() {
			this.edit = jasmine.createSpy('edit spy');
		});
		$provide.service('service')
	});
		module('app.momentsService');
	});

	beforeEach(inject(function(core, momentsService) {
		core_Mock = core;

		service_Mock = momentsService;
		service_Mock = {
			incrementCounter: jasmine.createSpy('incrementCounter spy')
		};
		service_Mock.momentArray = momentArray_Mock;

	}));
	// beforeEach(module('app.momentsService'));

	// beforeEach(inject(function($q) {
	// 	deferredLogin = $q.defer();

	// 	core_Mock = {
	// 		initiateMoments: jasmine.createSpy('initiateMoments spy')
	// 		.and.returnValue(deferredLogin.promise),
	// 	};
	// 	var $injector = angular.injector(['app.momentsService']);
	// 	service = $injector.get('momentsService');
	// }));

	// beforeEach(inject(function(_$rootScope_) {
	// 	$rootScope = _$rootScope_;
	// 	service.initializeView();
	// }));

		// it('Should call initiateMoments', function() {
		// 	service.initializeView();

		// 	expect(core_Mock.initializeView).toHaveBeenCalled();
		// });
it('Should call incrementCounter', function() {
	var liked = true;
	var counter = 2;

	service_Mock.incrementCounter(2);
	expect(service_Mock.updateObject).toHaveBeenCalledWith(true, 2);

	// expect(core_Mock.edit).toHaveBeenCalled();
});

});