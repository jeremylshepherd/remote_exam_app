
// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

//     'githubAuth': {
// 		'clientID': process.env.GITHUB_KEY,
// 		'clientSecret': process.env.GITHUB_SECRET,
// 		'callbackURL': process.env.APP_URL + 'auth/github/callback'
// 	},

    'googleAuth' : {
        'clientID'         : process.env.GOOGLE_ID,
        'clientSecret'     : process.env.GOOGLE_SECRET,
        'callbackURL'      : process.env.APP_URL + 'auth/google/callback'
    },
    
    'twitterAuth' : {
        'consumerKey'         : process.env.TWITTER_CONSUMER,
        'consumerSecret'     : process.env.TWITTER_SECRET,
        'callbackURL'      : process.env.APP_URL + 'auth/twitter/callback'
    },
    
    'facebookAuth' : {
        'clientID'         : process.env.FACEBOOK_ID,
        'clientSecret'     : process.env.FACEBOOK_SECRET,
        'callbackURL'      : process.env.APP_URL + 'auth/facebook/callback'
    }

};