Stuff you should know:

Moment's AWS S3 Database is set up like so:

1.  Every Moment is a .jpg image and it is named as such: <State>/<lat>_<lng>_<timeStamp_of_whenThePictureWasTaken>
          Ex: PA/40.0103647_-75.2625353_1493079258676.jpg
          -The object is named like this for efficiency.
          -Each object is categorized by the state so when we get the users location we can load only those moments 
