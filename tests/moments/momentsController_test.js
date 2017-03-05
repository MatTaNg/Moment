describe('Moment Controller', function() {
	var controller,
		momentsSvc_Mock;

		beforeEach(module('app.momentsCtrl'));

		beforeEach(inject(function($controller, momentsSvc_Mock) {
			momentsSvc_Mock = {
				updateObject: jasmine.createSpy('updateObject spy'),
				incrementCounter: jasmine.createSpy('incrementCounter spy')
					.and.returnValue(2); 
			};
		}));

		bestEach(inject(function(_$rootScope_) {
			$rootScope = _$rootScope_;
			controller.counter = 1
			controller.liked(1);
		}))

		describe('liked', function() {
			it('should call updateObject', function() {
				expect(momentsSvc_Mock.updateObject).toHaveBeenCalledWith(true, 1);
			});
			it('should call incrementCounter', function() {
				expect(momentsSvc_Mock.incrementCounter).toHaveBeenCalledWith(1);
			});
			describe('if on the last picture', function() {
				it('should call initializeView', function() {

				});
				it('should update the current image', function() {

				});
			});
			it('should update the current image', function() {

			});
		});
})