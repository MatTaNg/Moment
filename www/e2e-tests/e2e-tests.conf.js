exports.config = {  
    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {                
            args: ['--disable-web-security']
        } 
    },
    baseUrl: 'http://192.168.0.6:8100',
    specs: [
    '*.test.js'
    ],
    jasmineNodeOpts: {
        isVerbose: true,
    }
};

// exports.config = {
//   seleniumAddress: 'http://localhost:4444/wd/hub',
//   specs: ['selenium.js']
// };