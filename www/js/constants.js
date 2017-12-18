(function() {
	angular.module('constants', [])

	.constant("constants", {

		"MILISECONDS_IN_AN_HOUR": 3600000,
		"MILISECONDS_IN_A_DAY": 86400000,
		//IDs, Keys and constants
		"BUCKET_NAME": 'mng-moment',
		"BUCKET_REGION": 'us-east-1',
		"KEY_ID": 'AKIAIBIANXR773ZDLRMQ',
		"IDENTITY_POOL_ID": 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4',
		"ONE_PUSH_APP_ID": "53f08046-7a86-4d99-b95f-e74349b4dd0b",
		"GOOGLE_API_KEY": "AIzaSyAelWnG7f-Ee3PUeOkrc7y3v0cNgQ9t8K4",
		"REPORT_FILES": ['bugs.txt', 'errors.txt', 'feedback.txt', 'flagged.txt', 'logs.txt'],

		//Paths
		"IMAGE_URL": 'https://s3.amazonaws.com/' + "mng-moment" + '/',
		"MOMENT_PREFIX": "moment/",
		"BEST_MOMENT_PREFIX": "bestMoments/",
		"FEEDBACK_PREFIX": "reports/feedback/",
		"BUG_PREFIX": "reports/bugs/",
		"GEOLOCATION_URL": "http://maps.googleapis.com/maps/api/geocode/json?",

		//Configurations
		"MAX_DESCRIPTION_LENGTH": 180,
		"HOURS_BETWEEN_MOMENTS": 0,
		"HOURS_UNTIL_MOMENT_EXPIRES": 168,
		"BEST_MOMENTS_RATIO": 0.5,
		"DEFAULT_MOMENT_RADIUS_IN_MILES": 25,
		"BEST_MOMENTS_MIN_VIEWS": 10,
		"MAX_MOMENTS_PER_GET": 5,
		"MAX_NUM_OF_MOMENTS": 30,
		"MAX_DURATION_OF_VIDEO": 5, //In seconds
		"EXTRA_TIME_LIKES_GIVES_MOMENTS_MULTIPLIER": 3600000, //1 hour
		
		//Minor Configurations
		"HOW_FAR_USER_MUST_DRAG": 0.3,
		"MOMENT_EXTENSION": ".jpg",
		"LOCATION_NOT_FOUND_TXT": "We could not find your location",

		//Notification Messages
		"TIME_BETWEEN_NOTIFICATIONS": 3600000, //1 hour
		"MOMENT_BECOMES_BEST_MOMENT": "Congratulations! Your Moment has been voted to appear as a Best Moment!",
		"MORE_MOMENTS_FOUND": "Check out your new Moments before they disappear!",

		"MOCKED_COORDS": {lat: 40.0084, lng: 75.2605, town: "Narberth, PA", state: 'PA'},
		"DEV_MODE": false //Creates a mock UUID, lat, lng coords and does not filter moments by UUID
		
	})
})();