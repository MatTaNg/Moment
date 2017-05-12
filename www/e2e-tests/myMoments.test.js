describe('On the MyMoments page', function(){  

	beforeEach(function() {
		var editLocationText = 'Location';

		browser.driver.get('http://192.168.0.6:8100/#/page1/myMoments');
	});

	it('The edit button should work', function() {
		browser.driver.get('http://192.168.0.6:8100/#/page1/myMoments').then(function() {
			// browser.waitForAngular();
			browser.getCurrentUrl().then(function(url) {
			// 	browser.pause();

			// 	console.log("URL1");
			// 	console.log(url);
			// 	var editButton = element(by.buttonText('Edit'));
			// 	browser.wait(protractor.ExpectedConditions.elementToBeClickable(editButton), 3000);
			// 	// browser.actions().mouseMove(editButton).perform();
			// 	// editButton.click();
			// 	// var editButton = element(by.xpath(".//*[@id='page4']/ion-content/div/div[5]/div[2]/button"));
			// 	var popUpTitle;

			// 	browser.sleep(500);
			// 	browser.executeScript("arguments[0].click();", editButton);
			// 	editButton.click().then(function() {
			// 		editButton.click().then(function() {
			// 			browser.sleep(500);
			// 			popUpTitle = element(by.tagName('h3'));

			// 			popUpTitle.getText().then(function(text) {
			// 				console.log("TEXT");
			// 				console.log(text);
			// 				expect(text).toEqual(editLocationText);
			// 			});
			// 		});
			// 	});
			});
		});


	});
});