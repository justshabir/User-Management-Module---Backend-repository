import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import LinkedInStrategy from 'passport-linkedin-oauth2';
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import { IUser } from '../modules/users/model';
import user_service from '../modules/users/service';
dotenv.config();

const UserService = new user_service();

passport.serializeUser((user: IUser, done: any) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: number, done: any) => {
  const user_filter = { _id: id };
  UserService.filterUser(user_filter, (err: any, user: IUser) => {
    if (err) {
      console.log('Passport serialization error', err);
    }
    done(err, user);
  });
});

passport.use(
  new LocalStrategy.Strategy(async function (username: string, password: string, done: any) {
    /**
     * Write the logic for login using passport local strategy here
     */
  })
);

/**
 *
 * Social Strategies
 */
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALL_BACK_URL,
    },

    async function (accessToken, refreshToken, profile, done) {
      const id = profile.id;
      const email = profile.emails[0]?.value;
      const displayName = profile.displayName;
      const familyName = profile.name?.familyName;
      const givenName = profile.name?.givenName;
      const profilePhoto = profile.photos[0]?.value;

      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          const user_params: IUser = {
            name: {
              first_name: familyName || givenName,
              last_name: givenName || displayName,
            },
            email: email,
            source: 'google',
            status: 'Active',
            profilePhoto: profilePhoto,
            modification_notes: [
              {
                modified_on: new Date(Date.now()),
                modified_by: null,
                modification_note: 'New user created',
              },
            ],
          };
          return UserService.createUser(user_params, (err, user_data: IUser) => {
            return done(err, user_data);
          });
        } else if (currentUser.source != 'google') {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        }
        currentUser.lastVisited = new Date();
        return done(err, currentUser);
      });
    }
  )
);

passport.use(
  new LinkedInStrategy.Strategy(
    {
      clientID: process.env.LINKED_IN_CLIENT_ID,
      clientSecret: process.env.LINKED_IN_CLIENT_SECRET,
      callbackURL: process.env.LINKED_IN_CALL_BACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0]?.value;
      const displayName = profile.displayName;
      const familyName = profile.name?.familyName;
      const givenName = profile.name?.givenName;
      const profilePhoto = profile.photos[0]?.value;

      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          const user_params: IUser = {
            name: {
              first_name: familyName || givenName,
              last_name: givenName || displayName,
            },
            email: email,
            source: 'linkedin',
            status: 'Active',
            profilePhoto: profilePhoto,
            modification_notes: [
              {
                modified_on: new Date(Date.now()),
                modified_by: null,
                modification_note: 'New user created',
              },
            ],
          };
          return UserService.createUser(user_params, (err: any, user_data: IUser) => {
            return done(err, user_data);
          });
        }
        if (currentUser.source != 'linkedin') {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        }
        currentUser.lastVisited = new Date();
        return done(null, currentUser);
      });
    }
  )
);
