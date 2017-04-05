describe('Clicking on the login button ', function(){  
    var username, password, loginButton;

    beforeEach(function() {
        browser.get('/#/login');
        username = element(by.model('vm.username'));
        password = element(by.model('vm.password'));
        loginButton = element(by.linkText('Log in'));
    });

    it('should validate the credentials for a successful login and display the My Dinners view', function() {
        // TODO: test successful login
    })

    it('should display a popup for an unsuccessful login', function() {
        // TODO: test unsuccessful login
    });
});