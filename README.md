Stuff you should know:

We try to follow John Papa's AngularJS style guide as closely as possible:
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

Moment's AWS S3 Database is set up like so:

1.  Every Moment is a .jpg image and it is named as such: <State>/<lat>_<lng>_<timeStamp_of_whenThePictureWasTaken>
          Ex: PA/40.0103647_-75.2625353_1493079258676.jpg
          -The object is named like this for efficiency.
          -In order to know which Moment to load based on a users location we need to first get the object from the database and compare it to the users location.  Rather than load every Moment in the entire database, it is more efficient to load only those Moments in those states close to the user.  
          -After loading all these Moments we then compare the Moments to the users location and remove the ones too far away.
          -The timeStamp is there simply to make the file unique.
2.  Every Moment has metaData as such:
          -Likes, description, key, location, time, uuids, views.
          
          Likes: Doesn't need explanation
          Description: Also doesn't need explanation
          key: The key is in the file name but it is easier to have the key in the metaData with the rest of the information so that when we get the metaData we get it with the key as well.  Getting the Object and getting the metaData of that Object are two different calls.
          Location: Location of the Moment
          Time: The time listed using the JavaScript new Date().getTime() function.  This returns the number of milliseconds since 1970/01/01.  In the code we convert this to a date by subtracting this number with the current new Date().getTime().  This will give us the amount of miliseconds occured between the day this Moment was submitted and the current time and we can convert that to an actual date
          uuids: List the UUIDs that saw this Moment so we don't show this moment to the same device twice.
          views: This is only used to compare with the Likes data so we have a parameter to know whether or not to put this Moment in BestMoments.
          
3.  Reports, feedback, logs and error messages can be found in the reports folder.
4.  The code will remove Moments which have expired when the User tries to grab an image from the database.
5.  For a high level summary of how the code works you can go to www.draw.io.com and open the xml diagrams.