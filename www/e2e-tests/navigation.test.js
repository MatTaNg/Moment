describe('When the user clicks on the myMoments tab', function(){  

    beforeEach(function() {
        browser.get('/#/page1/moments');
        browser.pause();
        // username = element(by.model('vm.username'));
        // password = element(by.model('vm.password'));
        // loginButton = element(by.linkText('Log in'));
    });

    it('should take the user to the myMoments page', function() {
        var myMomentsTab = element(by.css("[nav-bar='active'] .ion-person"))
        myMomentsTab.click().then(function() {
            browser.getCurrentUrl().then(function(url) {
                console.log("MY-MOMENTS");
                console.log(url);
                expect(url).toContain('myMoments');
            });
        });
    });
});
describe('When the user clicks on the best Moments tab', function() {

    it('should take the user to the bestMoments page', function() {

        var bestMomentsTab = element(by.xpath(".//*[@id='tabsController-tabs1']/div/a[2]"));
        bestMomentsTab.click().then(function() {
            browser.getCurrentUrl().then(function(url) {
                console.log("BEST MOMENTS");
                console.log(url);
                expect(url).toContain('bestMoments');
            });
        });
    });
});
describe('When the user clicks on the Moments tab', function() {
    var momentTab = element(by.xpath(".//*[@id='tabsController-tabs1']/div/a[1]"));

    it('should take the user to the Moments page', function() {
        momentTab.click().then(function() {
            browser.getCurrentUrl().then(function(url) {
                console.log("MOMENTS");
                console.log(url);
                expect(url).toContain('moments');
            });
        });
    });
});

