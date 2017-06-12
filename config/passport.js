var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var mongoClient = require('./db');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
        process.nextTick(function() {
        var db =  mongoClient.getDb();
        db.collection('users').findOne({'email': email}, function(err, user){
        if (err)
            return done(err);
        if (user) {
          return done(null, false, req.flash('flashMessage', 'That email is already taken.'));
        } else {
        db.collection('users').insertOne({
          "email" : email,
          "password": EncryptPassword(password)
        }, function(err, newUser){
            if (err)
              throw err;
            return done(null, newUser);
        });
      }
    });
  });
}));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
   var db =  mongoClient.getDb();
   db.collection('users').findOne({'email': email}, function(err, user){
     if(err)
        return done(err);
      if(!user)
        return done(null, false, req.flash('flashMessage', 'No such user found.'));
      if (!isValidPassword(password, user.password)){
          return done(null, false, req.flash('flashMessage', 'Your password is incorrect.'));
        }
        return done(null, user);
   });

  }));

};

function EncryptPassword (password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

function isValidPassword (userPassword, dbPassword) {
  return bcrypt.compareSync(userPassword, dbPassword);
};
