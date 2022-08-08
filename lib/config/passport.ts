import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import LinkedInStrategy from 'passport-linkedin-oauth2';
import MicrosoftStrategy from 'passport-microsoft';
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import { IUser } from '../modules/users/model';
import user_service from '../modules/users/service';
import { accountSourceEnum, accountStatusEnum } from '../utils/enums';
dotenv.config();

const UserService = new user_service();

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
          const userParams: IUser = {
            name: {
              firstName: familyName || givenName,
              lastName: givenName || displayName,
            },
            email: email,
            source: 'google',
            status: 'Active',
            profilePhoto: profilePhoto,
            modificationNotes: [
              {
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'New user created',
              },
            ],
          };
          return UserService.createUser(userParams, (err, userData: IUser) => {
            return done(err, userData);
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
          const userParams: IUser = {
            name: {
              firstName: familyName || givenName,
              lastName: givenName || displayName,
            },
            email: email,
            source: accountSourceEnum.LINKEDIN,
            status: accountStatusEnum.ACTIVE,
            profilePhoto: profilePhoto,
            modificationNotes: [
              {
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'New user created',
              },
            ],
          };
          return UserService.createUser(userParams, (err: any, userData: IUser) => {
            return done(err, userData);
          });
        }
        if (currentUser.source != accountSourceEnum.LINKEDIN) {
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
passport.use(
  new MicrosoftStrategy.Strategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALL_BACK_URL,
      scope: ['user.read'],
    },
    async function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0]?.value;
      const displayName = profile.displayName;
      const familyName = profile.name?.familyName;
      const givenName = profile.name?.givenName;
      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          const userParams: IUser = {
            name: {
              firstName: familyName || givenName,
              lastName: givenName || displayName,
            },
            email: email,
            source: accountSourceEnum.MICROSOFT,
            status: accountStatusEnum.ACTIVE,
            profilePhoto: '',
            modificationNotes: [
              {
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'New user created',
              },
            ],
          };
          return UserService.createUser(userParams, (err: any, userData: IUser) => {
            return done(err, userData);
          });
        }
        if (currentUser.source != accountSourceEnum.MICROSOFT) {
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
