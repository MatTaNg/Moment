describe('OKCupid', function() {
  it('should automatically send messages', function() {
    browser.get('/#/page1/moments');

  });
});
// describe('On the Moment page', function(){  

//     beforeEach(function() {
//         var popUpTitle_ExpectedText = "Report";

//         browser.get('/#/page1/moments');
//     });

//     it('User should be able to swipe left', function() {
//         browser.wait(function() {
//             return element(by.css('td-card')).isDisplayed().then(function(){
//                 console.log("CHECK...");
//                 var card = element(by.css('.td-card'));

//                 browser.actions()
//                 .mouseMove(card, {x: 0, y: 0})
//                 .mouseDown()
//                 .mouseMove({x: -100, y: 0})
//                 .mouseUp()
//                 .perform();
//                 return true;    
//             });
//         }, 3000)
//         console.log("Continue");
//     });

//     it('User should be able to swipe right', function() {

//     });

//     // it('User should be able to use the feedback button', function() {
//     //     var flag = element(by.css('div.ion-ios-flag-outline'));

//     //     flag.click().then(function() {
//     //         var popUpTitle = element(by.css('popup-title'));
//     //         popUpTitle.getText().then(function(text) {
//     //             console.log("TEXT");
//     //             console.log(text);
//     //             expect(text).toEqual(popUpTitle_ExpectedText);
//     //         });
//     //     });
//     // });

//     // it('Flag button should be disabled once clicked on', function() {
//     //     var flag = element(by.css('.ion-ios-flag-outline'));

//     //     flag.click().then(function() {
//     //         var popUpTitle = element(by.css('popup-title'));

//     //         flag.click().then(function() {

//     //         });
//     //     });
//     // });

// });
