describe('Moment Service', function() {

	var service;

	beforeEach(module('app'));
	// beforeEach(module('momentViewDirective'), []);

	beforeEach(inject(function($injector) {
		service = $injector.get('momentsService');
	}));

	it('test', function() {

	});

});