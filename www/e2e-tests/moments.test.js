describe('Clicking on the login button ', function(){  

    beforeEach(function() {
        browser.get('/#/page1/moments');
        browser.pause();
        // username = element(by.model('vm.username'));
        // password = element(by.model('vm.password'));
        // loginButton = element(by.linkText('Log in'));
    });

    it('should validate the credentials for a successful login and display the My Dinners view', function() {
        // TODO: test successful login
        expect(true).toEqual(true);
    })

    it('should display a popup for an unsuccessful login', function() {
        // TODO: test unsuccessful login
        expect(true).toEqual(true);
    });
});