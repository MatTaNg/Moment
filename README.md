<b>Gold Copy Testing</b>
1.  Turn DEV mode on in constants.js

1.  Delete everything in the test folder in S3 bucket
2.  Swipe all the moments

- After all the moments are gone a No Moments Found icon should appear

1.  Take a picture
2.  Submit it.
3.  Upload a picture
4.  Submit it, uncheck the location checkbox and add a description.
5.  Picture should appear on moments page and in DB
6.  Swipe right, should reload the same image with 1 like on it.
7.  Swipe left, should reload the asme image with 1 like on it.
8.  Keep swiping right until the moment ends up in the bestMoments folder
9.  Check the bestMoments folder to see if it is there.
10.  Delete the moment from the bestMoments folder in the DB
11.  Pull down to refresh all bestMoments.
12. Your new bestMoment should no longer be there.

Navigate to myMoments page
1.  Confirm that your new moment is on that page
2.  Confirm that It has correctly incremented the likes there.
3.  Change the radius to 50 miles
4.  Edit your location to an incorrect location using both zip code and town, state format
5.  Error message should appear.
6.  Click the location icon in the Edit location menu and verify it gets your current location.
7.  Cancel out of the location box.
8.  Correctly Edit your location using the town, state format to a place less than 50 miles away.
9.  Navigate to the moment page.
10.  Moments should still be there.
11.  Navigaate to the myMoments page.
12.  Change the radius to 5 miles.
13.  Navigate to the moment page.
14.  Should display, No Moments found.
15.  Type in a zip code 5+ miles away (EX: 07670).
16.  Navigate to the Moment page.
17.  No Moments should be shown.

Delete your moments
1.  Navigate to the myMoments page.
2.  No Moments should show.
3.  Navigate to the Moment page.
4.  No Moments should show.

<b>Updating the app on Google Play</b>
<b>Reference</b>https://stackoverflow.com/questions/42290083/how-do-i-publish-an-updated-version-of-my-existing-ionic-app-on-google-play-stor
1. Increment versionCode and versionName in AndroidManifest.xml
2. Run "Cordova build --release android"
  - This will crease a "android-release-unsigned.apk" file in moment\platforms\android\build\outputs\apk
3.  Copy the the C:\Users\Andy\Google Drive\Programming\moment\platforms\android\build\outputs\apk\android-x86-release-unsigned.apk into the same folder as the keystore which should be moment/platforms/android.  Then CD into that folder.
  -  This step is optional but will make things easier
4. Run "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore Moment.keystore android-x86-release-unsigned.apk moment"
  -  In this step we sign the unreleased apk with our keystore.
  -  The password is the same as your old WoW password.
5. Run "zipalign -v 4 android-x86-release-unsigned.apk android-release-signed.apk"
 
<b>Used APIs/Libraries</b>

Tinder Cards - https://github.com/ionic-team/ionic-ion-tinder-cards

Videogular - http://www.videogular.com/

Content Banner - https://github.com/djett41/ionic-content-banner

Geolocation - http://ngcordova.com/docs/plugins/geolocation/

Google Maps - https://developers.google.com/maps/documentation/javascript/geolocation (To get current position)

AWS S3 - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

Cordova Camera - https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/

Cordova Media Capture - https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-media-capture/index.html (video)


<b>Stuff you should know:</b>

Go to www.oneSignal.com to send notifications

To configure the app easily go to www/js/constant.js

We try to follow John Papa's AngularJS style guide as closely as possible:
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

Moment's AWS S3 Database is set up like so:

<b>1.  Every Moment is a .jpg image and it is named as such: </b>

      <state>/<lat>_<lng>_<timeStamp_of_whenThePictureWasTaken>
   
    Ex: PA/40.0103647_-75.2625353_1493079258676.jpg

    -The object is named like this for efficiency.

    -In order to know which Moment to load based on a users location we need to first get the object from the database and compare it to the users location.  Rather than load every Moment in the entire database, it is more efficient to load only those Moments in those states close to the user.  

      -After loading all these Moments we then compare the Moments to the users location and remove the ones too far away.

      -The timeStamp is there simply to make the file unique.
          
<b>2.  Every Moment has metaData as such:</b>
        -Likes, description, key, location, time, uuids, views.

        Likes: Doesn't need explanation 

        Description: Also doesn't need explanation

        key: The key is in the file name but it is easier to have the key in the metaData with the rest of the information so that when we get the metaData we get it with the key as well.  Getting the Object and getting the metaData of that Object are two different calls.

        Location: Location of the Moment

        Time: The time listed using the JavaScript new Date().getTime() function.  This returns the number of milliseconds since 1970/01/01.  In the code we convert this to a date by subtracting this number with the current new Date().getTime().  This will give us the amount of miliseconds occured between the day this Moment was submitted and the current time and we can convert that to an actual date

       uuids: List the UUIDs that saw this Moment so we don't show this moment to the same device twice.

       <b>views</b>: This is only used to compare with the Likes data so we have a parameter to know whether or not to put this Moment in BestMoments.
          
3.  Reports, feedback, logs and error messages can be found in the reports folder.
4.  The code will remove Moments which have expired when the User tries to grab an image from the database.
5.  For a high level summary of how the code works you can go to www.draw.io.com and open the xml diagrams contained in this repository.
6.  In constants.js there is a variable called "DEV_MODE"; setting this to false allows you to use ionic serve by shutting off anything having to do with location tracking.

<b> Known Issues </b>
1.  Seems like JavaScript enjoys to torture me by setting a global variable to undefined for no reason at all.  Two examples are in moments.controller and moments.service.  You will see an angry line with a comment perplexed as to this behavior.
1a. I was able to solve some of these problems by creating a temp variable although it did not always work.

2.  $ionicPopUp takes up quite a lot of space in the code.  It would be nice to find a way to refactor this code into some kind of custom directive along with the $ionicContentBanner.

3.  Errors can probably be handled better.

4.  Half of the Unit tests don't work.  You have to add a 'this.' in the production code - Which breaks the production code.
 --> https://stackoverflow.com/questions/46044025/jasmine-spyon-does-not-mock-function-correctly/46265370#46265370
 
5.  There is a problem with logger.js where I cannot get a text file returned as a String.  It keeps coming back as an [object Object].  As a band-aid the function just adds a new file for each new feedback, log or error.
