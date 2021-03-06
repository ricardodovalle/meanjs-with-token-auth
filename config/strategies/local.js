'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

var jwt = require('jwt-simple');
var secret = 'keepitquiet';

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne({
				username: username
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				return done(null, user);
			});
		}
	));

	passport.use('local-token', new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'	
		},
		function(username, password, done) {

			User.findOne({
				username: username
			}, function(err, user) {
				if (err) {
					console.log(err);
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				// generate login token
				var tokenPayload = { 
					username: user.username, 
					loginExpires: user.loginExpires
				};
				var loginToken = jwt.encode(tokenPayload, secret);

				// add token and exp date to user object
				user.loginToken = loginToken;
				user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

				// save user object to update database
				user.save(function(err) {
					if(err){
						done(err);
					} else {
						done(null, user);
					}
				});
			});
		}
	));
};