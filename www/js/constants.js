(function() {
	angular.module('constants', [])

	.constant("constants", {
		"BUCKET_NAME": 'mng-moment',
		"BUCKET_REGION": 'us-east-1',
		"KEY_ID": 'AKIAJVH2FRYBZESGBD6Q',
		"SECRET_KEY": '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',
		"IDENTITY_POOL_ID": 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4',
		"IMAGE_URL": 'https://s3.amazonaws.com/' + "mng-moment" + '/',

		"MOMENT_PREFIX": "test/",
		"BEST_MOMENT_PREFIX": "bestMoments/",
		"FEEDBACK_PREFIX": "reports/feedback/",
		"BUG_PREFIX": "reports/bugs/",

		"MAX_DESCRIPTION_LENGTH": 180,
		"HOURS_BETWEEN_MOMENTS": 12,
		"HOURS_UNTIL_MOMENT_EXPIRES": 24,
		"MILISECONDS_IN_AN_HOUR": 3600000,
		"BEST_MOMENTS_RATIO": 0.5,

		"GEOLOCATION_URL": "https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=",

		"DEV_MODE": true
	})
})();
