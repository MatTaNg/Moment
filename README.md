<b>Gold Copy Testing</b>

<u>Set up</u>
1.  Connect device and remove data cache from device (Settings -> App -> Moment -> Storage -> Clear Data).
2.  Go into constants.js and set DEV_MODE to false and set moments and bestMoments to test regions.
3.  Run ionic cordova run android in the command terminal once the device is connected.
4.  Go into the aws console and remove everything from the momentTest and bestMomentsTest folders.

<u>The Test</u>
1.	*App should prompt for location access.
2.	*No Moments found image should appear
3.	Attempt to take a max-length video – App should prompt for file access
4.	Play video and add a description
5.	Submit the moment while the video is playing.
<i>Wait at least a minute</i>
6.	Go over to the myMoments section. 
7.	Play the video
8.	Go to AWS database, remove your UUID, set the likes to 100 and views to 20.
9.	Change the search radius to 50 miles.
10.	Edit the location to “MMM”. An Error message should appear
11. Click the location button - Your current location should appear.
12. Edit the location to "Malvern, PA"
13.	<b>Go to Moments</b> – Your video should appear (If you are within 50 miles of Malvern, PA).
14. You should get a notification telling you your moment has been promoted.
15.	Play the video.
16.	Swipe right on the video.
17.	*No Moments should appear
18.	Go back to the myMoments tab and make sure likes has incremented by 1, and there is a green +1 at the top. (101 Likes).
19.	Take a picture
20.	Attempt to add a description that’s too long and submit it.
21.	Add a valid description and uncheck the location box
22.	Go to myMoments and make sure the picture shows up.
23.	Go to AWS database, remove your UUID, set the likes to 100 and views to 20.
24. Toggle "Show My Comments" on and off.  It should no show any moments toggled on.
25. Comment, edit like, and reply on the picture and/or the video
26. Going back should show 2 comments - Or however many comments & replies there are for the specific moment.
27. Toggle "Show My Comments" on and off.  It should show your commented on moments when toggled on.
28.	<b>Go back to Moments</b> and be sure your picuture appears with an “Unknown” location and it should update the comments too
29. Click on the comments and be sure it matches with the comments from step 22.
30.	Swipe right on the picture.
31.	Go to best moments – Your picture and video should appear with the correct comments.
32.	Go to AWS database and set your picture time meta data to 10 and remove your UUID once again.
33.	Go to Moments - It should show No Moments Found.
34.	It should be removed from the Moments database but NOT from BestMoments.

<b>Updating the app on Google Play</b>
<b>Reference</b>https://stackoverflow.com/questions/42290083/how-do-i-publish-an-updated-version-of-my-existing-ionic-app-on-google-play-stor
1. Increment versionCode and versionName in AndroidManifest.xml
2. Run "cordova build --release android" in the root folder of the project.
  - This will crease a "android-release-unsigned.apk" file in moment\platforms\android\build\outputs\apk
3. Go to https://play.google.com/apps/publish/?account=7835354612490500415#ManageReleasesPlace:p=com.ionicframework.moment2380651
4. Upload the debug apk in moment\platforms\android\build\outputs\apk.
 
<b>Used APIs/Libraries</b>

Tinder Cards - https://github.com/ionic-team/ionic-ion-tinder-cards

Videogular - http://www.videogular.com/

Content Banner - https://github.com/djett41/ionic-content-banner

Geolocation - http://ngcordova.com/docs/plugins/geolocation/

Google Maps - https://developers.google.com/maps/documentation/javascript/geolocation (To get current position)

AWS S3 - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

Cordova Camera - https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/

Cordova Media Capture - https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-media-capture/index.html (video)

Permissions - https://github.com/NeoLSN/cordova-plugin-android-permissions


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

6.  When running unit tests you must comment out these lines:
   'jett.ionic.content.banner', 'ionic.contrib.ui.tinderCards',
   "ngSanitize",
   "com.2fdevs.videogular",
   "com.2fdevs.videogular.plugins.controls",
   "com.2fdevs.videogular.plugins.overlayplay",
   "com.2fdevs.videogular.plugins.poster"])
   
7.  If a moments UUID has only a space character then swiping will fail to update the UUID.  This can only occur if an admin manually erases the UUID.
