describe('Moment Controller', function() {
	var controller,
	deferred,
	momentsSvc_Mock;

	beforeEach(module('app.MomentsController'));

	beforeEach(inject(function($controller, $q) {
		deferred = $q.defer();

		momentsSvc_Mock = {
			incrementCounter: jasmine.createSpy('incrementCounter spy')
			.and.returnValue(2),
			initializeView: jasmine.createSpy('initializeView spy')
			.and.returnValue(deferred.promise),
			updateObject: jasmine.createSpy('update Object spy'),
			getMoments: jasmine.createSpy('get Moments spy')
			.and.returnValue('2')
		};
		controller = $controller('MomentsController', {
			'momentsService': momentsSvc_Mock
		});

	}));

	beforeEach(inject(function(_$rootScope_) {
		$rootScope = _$rootScope_;
		controller.counter = 2;
		controller.liked(true);
	}))

	describe("When calling the liked function", function() {

		it("should call update object", function() {
			expect(momentsSvc_Mock.updateObject).toHaveBeenCalledWith(true, 2);
		});
		it("should call incrementCounter", function() {
			expect(momentsSvc_Mock.incrementCounter).toHaveBeenCalledWith(2);
		});
		it("should call getMoments", function() {
			expect(momentsSvc_Mock.getMoments).toHaveBeenCalled();
		});

		describe("If there are no more moments and liked is called", function() {
			beforeEach(inject(function($controller) {
				momentsSvc_Mock = {
					incrementCounter: jasmine.createSpy('incrementCounter spy')
					.and.returnValue(-1),
					initializeView: jasmine.createSpy('initializeView spy')
					.and.returnValue(deferred.promise),
					updateObject: jasmine.createSpy('update Object spy'),
					getMoments: jasmine.createSpy('get Moments spy')
					.and.returnValue('2')
				};
				controller = $controller('MomentsController', {
					'momentsService': momentsSvc_Mock
				});
			}));

			beforeEach(inject(function(_$rootScope_) {
				$rootScope = _$rootScope_;
				controller.counter = 2;
				controller.liked(true);
			}))

		it("should call initialize view again", function() {
			expect(momentsSvc_Mock.initializeView.calls.count()).toEqual(2);
		});
	});
	});
});