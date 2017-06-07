(function() {
	angular.module('constants', [])

	.constant("constants", {

		"MILISECONDS_IN_AN_HOUR": 3600000,
		//IDs and Keys and constants
		"BUCKET_NAME": 'mng-moment',
		"BUCKET_REGION": 'us-east-1',
		"KEY_ID": 'AKIAIBIANXR773ZDLRMQ',
		"IDENTITY_POOL_ID": 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4',
		"ONE_PUSH_APP_ID": "53f08046-7a86-4d99-b95f-e74349b4dd0b",
		"GOOGLE_API_KEY": "AIzaSyAelWnG7f-Ee3PUeOkrc7y3v0cNgQ9t8K4",
		"REPORT_FILES": ['bugs.txt', 'errors.txt', 'feedback.txt', 'flagged.txt', 'logs.txt'],

		//Paths
		"IMAGE_URL": 'https://s3.amazonaws.com/' + "mng-moment" + '/',
		"MOMENT_PREFIX": "test/",
		"BEST_MOMENT_PREFIX": "bestMoments/",
		"FEEDBACK_PREFIX": "reports/feedback/",
		"BUG_PREFIX": "reports/bugs/",
		"GEOLOCATION_URL": "http://maps.googleapis.com/maps/api/geocode/json?",

		//Configurations
		"MAX_DESCRIPTION_LENGTH": 180,
		"HOURS_BETWEEN_MOMENTS": 0,
		"HOURS_UNTIL_MOMENT_EXPIRES": 24,
		"BEST_MOMENTS_RATIO": 0.5,
		"DEFAULT_MOMENT_RADIUS_IN_MILES": 25,
		"BEST_MOMENTS_MIN_VIEWS": 10,
		"MAX_KEYS": 50,
		
		//Minor Configurations
		"HOW_CLOSE_TO_EDGE_OF_SCREEN_USER_MUST_DRAG_MOMENT": 0.3,
		"MOMENT_EXTENSION": ".jpg",

		"DEV_MODE": false
	})
})();
// AIJvTx/0jXboCBh5PtuUQwRKde4zTchmUKYjcCIF