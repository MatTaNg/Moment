(function() {
	angular.module('constants', [])

	.constant("constants", {
		//IDs and Keys
		"BUCKET_NAME": 'mng-moment',
		"BUCKET_REGION": 'us-east-1',
		"KEY_ID": 'AKIAIBIANXR773ZDLRMQ',
		"IDENTITY_POOL_ID": 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4',
		"ONE_PUSH_APP_ID": "53f08046-7a86-4d99-b95f-e74349b4dd0b",
		"GOOGLE_API_KEY": "AIzaSyAelWnG7f-Ee3PUeOkrc7y3v0cNgQ9t8K4",

		//Paths
		"IMAGE_URL": 'https://s3.amazonaws.com/' + "mng-moment" + '/',
		"MOMENT_PREFIX": "test/",
		"BEST_MOMENT_PREFIX": "bestMoments/",
		"FEEDBACK_PREFIX": "reports/feedback/",
		"BUG_PREFIX": "reports/bugs/",
		"GEOLOCATION_URL": "http://maps.googleapis.com/maps/api/geocode/json?",

		//Configurations
		"ION_GALLERY_ROW_SIZE": 2,
		"MAX_DESCRIPTION_LENGTH": 180,
		"HOURS_BETWEEN_MOMENTS": 12,
		"HOURS_UNTIL_MOMENT_EXPIRES": 24,
		"MILISECONDS_IN_AN_HOUR": 3600000,
		"BEST_MOMENTS_RATIO": 0.5,
		"DEFAULT_MOMENT_RADIUS_IN_MILES": 25,

		"DEV_MODE": true
	})
})();
// AIJvTx/0jXboCBh5PtuUQwRKde4zTchmUKYjcCIF