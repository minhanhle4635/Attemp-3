// const LocalStrategy = require('passport-local').Strategy
// const bcrypt = require('bcrypt')

// module.exports = function(passport, getUserByEmail){
//     const authenticateUser = async (email, password, done)=>{
//         const user = getUserByEmail(email)
//         //check if user's email is exist or not
//         if (user == null){
//             return done(null, false, {message: 'No user with that email'})
//         }
//         //check password
//         try{
//             if(await bcrypt.compare(password, User.password)){
//                 return done(null, user)
//             }else{
//                 return(done, false, {message: 'password incorrect'})
//             }
//         }catch(e){
//             return done(e)
//         }
//     }
//     passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
//     passport.serializeUser(function(user, done){
//         done(null,user.id)
//     })
//     passport.deserializeUser(function(id, done){
//         User.findById(id, function(err,user){
//             done(err,user)
//         }
//     )}
//     )
// }

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// load User model
const User = require('./models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // match user
      User.findOne({ email: email }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) console.log(err)
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};