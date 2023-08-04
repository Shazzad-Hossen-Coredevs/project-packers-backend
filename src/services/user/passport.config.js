const GoogleStrategy = require('passport-google-oauth2').Strategy;
import { Strategy as FacebookStrategy } from 'passport-facebook';
const passport = require('passport');
import User from './user.schema';

export const passportAuth = ({ db, settings }) => {
//Google Strategy
  passport.use(new GoogleStrategy({
    clientID: settings.GOOGLE_CLIENT_ID,
    clientSecret: settings.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/api/user/google/callback',
    scope: ['profile', 'email',],
  },
  async function (accessToken, refreshToken, profile, done) {
    const user = await db.findOne({ table: User, key: { email: profile._json.email } });
    if (!user) {
      const newUser = await db.create({ table: User, key: { name: profile._json.name, email: profile._json.email, avatar: profile._json.picture } });
      if (!newUser) return done(null, null);
      return done(null, newUser);
    }
    return done(null, user);
  }
  ));

  //facebook Strategy
  passport.use(new FacebookStrategy(
    {
      clientID: settings.FACEBOOK_CLIENT_ID,
      clientSecret: settings.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/api/user/facebook/callback'
    }, async(accessToken, refreshToken, profile, done) => {
      const user = await db.findOne({ table: User, key: { fbId: profile.id } });
      if (!user) {
        const newUser = db.create({ table: User, key: { fbId: profile.id, name: profile.displayName } });
        if (!newUser) return done(null, null);
        return done(null, newUser);
      }
      return done(null, user);

    }
  ));




  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });


};
