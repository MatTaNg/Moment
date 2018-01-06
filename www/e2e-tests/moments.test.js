describe('On the Moment page', function(){  

    beforeEach(function() {
        var popUpTitle_ExpectedText = "Report";

        browser.get('/#/page1/moments');
        browser.waitForAngular();
    });

    it('User should be able to swipe left', function() {
        var done = false;
            element(by.css('td-cards')).isDisplayed().then(function(){
            	console.log("CARDS");
	            	element(by.css('#temp')).isPresent().then(function(){
		                console.log("CHECK...");
		                var card = element(by.css('td-card'));
		                browser.actions()
		                .mouseMove({x: 500, y: 400})
		                .mouseDown()
		                .mouseMove({x: 50, y: 400})
		                .mouseUp()
		                .perform();
                        // done = true;
		                // return true;    
	            	});
            });
            browser.wait(function() {
                // console.log("WAITING");
                if(done) {
                    console.log("DONE");
                    return true;
                }
            }).then(function() {
                console.log("FINISHED");
            });
    });

    it('User should be able to swipe right', function() {

    });

    // it('User should be able to use the feedback button', function() {
    //     var flag = element(by.css('div.ion-ios-flag-outline'));

    //     flag.click().then(function() {
    //         var popUpTitle = element(by.css('popup-title'));
    //         popUpTitle.getText().then(function(text) {
    //             console.log("TEXT");
    //             console.log(text);
    //             expect(text).toEqual(popUpTitle_ExpectedText);
    //         });
    //     });
    // });

    // it('Flag button should be disabled once clicked on', function() {
    //     var flag = element(by.css('.ion-ios-flag-outline'));

    //     flag.click().then(function() {
    //         var popUpTitle = element(by.css('popup-title'));

    //         flag.click().then(function() {

    //         });
    //     });
    // });

});
