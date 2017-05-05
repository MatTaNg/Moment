describe('The user should be able to navigate to different tabs ', function(){  

    beforeEach(function() {
        browser.get('/#/page1/moments');
        browser.pause();
        // username = element(by.model('vm.username'));
        // password = element(by.model('vm.password'));
        // loginButton = element(by.linkText('Log in'));
    });

    it('should take the user to the moments page', function() {
        // TODO: test successful login
        
        expect(true).toEqual(true);
    })

    it('should display a popup for an unsuccessful login', function() {
        // TODO: test unsuccessful login
        expect(true).toEqual(true);
    });
});