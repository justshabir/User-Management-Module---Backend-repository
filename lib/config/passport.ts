import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import LinkedInStrategy from 'passport-linkedin-oauth2';
import MicrosoftStrategy from 'passport-microsoft';
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import { IUser } from '../modules/users/model';
import { IUploadProfileImage } from '../modules/upload/model';
import userService from '../modules/users/service';
import uploadService from '../modules/upload/service';
import { accountSourceEnum, accountStatusEnum } from '../utils/enums';
import cryptoJs from 'crypto-js';

dotenv.config();

const UserService = new userService();
const UploadService = new uploadService();

passport.use(
  new LocalStrategy.Strategy(async function (username: string, password: string, done: any) {
    UserService.filterUser(
      { email: username },
      (err: any, user: IUser) => {
        if (!user) {
          return done(err, false, {
            message: `User with username ${username} does not exist`,
          });
        }

        if (user.source != 'local') {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        }
        const hashedPassword = cryptoJs.AES.decrypt(user.password, process.env.CRYPTO_JS_PASS_SEC);
        const originalPassword = hashedPassword.toString(cryptoJs.enc.Utf8);
        if (!(password == originalPassword)) {
          return done(err, false, { message: `Wrong credentials` });
        }
        return done(null, user);
      },
      true
    );
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
      let profileImageId: any;

      // Upload the image and save the imageId to the DB
      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          if (profile.photos?.[0]?.value) {
            const imageParams = {
              imageUrl: profile.photos[0]?.value,
            };
            UploadService.uploadPhoto(
              imageParams,
              (err: any, uploadedImage: IUploadProfileImage) => {
                profileImageId = uploadedImage?._id;
                const userParams: IUser = {
                  name: {
                    firstName: familyName || givenName,
                    lastName: givenName || displayName,
                  },
                  email: email,
                  profilePhoto: profileImageId,
                  source: accountSourceEnum.GOOGLE,
                  status: accountStatusEnum.ACTIVE,
                  refId: id,
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
              }
            );
          } else {
            const userParams: IUser = {
              name: {
                firstName: familyName || givenName,
                lastName: givenName || displayName,
              },
              email: email,
              source: accountSourceEnum.GOOGLE,
              status: accountStatusEnum.ACTIVE,
              refId: id,
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
          }
        } else if (currentUser.source !== accountSourceEnum.GOOGLE) {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        } else {
          currentUser.lastVisited = new Date();
          return done(err, currentUser);
        }
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
      const id = profile.id;
      const email = profile.emails[0]?.value;
      const displayName = profile.displayName;
      const familyName = profile.name?.familyName;
      const givenName = profile.name?.givenName;
      let profileImageId: any;

      // Upload the image and save the imageId to the DB

      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          if (profile.photos?.[0]?.value) {
            const imageParams = {
              imageUrl: profile.photos[0]?.value,
            };
            UploadService.uploadPhoto(
              imageParams,
              (err: any, uploadedImage: IUploadProfileImage) => {
                profileImageId = uploadedImage?._id;
                const userParams: IUser = {
                  name: {
                    firstName: familyName || givenName,
                    lastName: givenName || displayName,
                  },
                  email: email,
                  profilePhoto: profileImageId,
                  source: accountSourceEnum.LINKEDIN,
                  status: accountStatusEnum.ACTIVE,

                  refId: id,
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
            );
          } else {
            const userParams: IUser = {
              name: {
                firstName: familyName || givenName,
                lastName: givenName || displayName,
              },
              email: email,
              source: accountSourceEnum.LINKEDIN,
              status: accountStatusEnum.ACTIVE,

              refId: id,
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
        } else if (currentUser.source != accountSourceEnum.LINKEDIN) {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        } else {
          currentUser.lastVisited = new Date();
          return done(null, currentUser);
        }
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
      const id = profile.id;
      const email = profile.emails[0]?.value;
      const displayName = profile.displayName;
      const familyName = profile.name?.familyName;
      const givenName = profile.name?.givenName;
      let profileImageId: any;

      // Upload the image and save the imageId to the DB
      UserService.filterUser({ email }, (err: any, currentUser: IUser) => {
        if (!currentUser) {
          if (profile.photos?.[0]?.value) {
            const imageParams = {
              imageUrl: profile.photos[0]?.value,
            };
            UploadService.uploadPhoto(
              imageParams,
              (err: any, uploadedImage: IUploadProfileImage) => {
                profileImageId = uploadedImage?._id;
                const userParams: IUser = {
                  name: {
                    firstName: familyName || givenName,
                    lastName: givenName || displayName,
                  },
                  email: email,
                  profilePhoto: profileImageId,
                  source: accountSourceEnum.MICROSOFT,
                  status: accountStatusEnum.ACTIVE,
                  refId: id,

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
            );
          } else {
            const userParams: IUser = {
              name: {
                firstName: familyName || givenName,
                lastName: givenName || displayName,
              },
              email: email,
              source: accountSourceEnum.MICROSOFT,
              status: accountStatusEnum.ACTIVE,
              refId: id,

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
        } else if (currentUser.source != accountSourceEnum.MICROSOFT) {
          return done(err, false, {
            message: `You have previously signed up with a different signin method`,
          });
        } else {
          currentUser.lastVisited = new Date();
          return done(null, currentUser);
        }
      });
    }
  )
);
passport.serializeUser((user: IUser, done: any) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: number, done: any) => {
  const userFilter = { _id: id };
  UserService.filterUser(userFilter, (err: any, user: any) => {
    if (err || !user) {
      done(err, null);
      console.log('Passport deserializeUser error', err);
      return;
    }
    // THIS CAN BE SIMPLIFY BY POPULATING THE USER DURING THE FILTER
    user.populate('profilePhoto', (err: any, userData: any) => {
      if (err) return console.log(err);
      const profilePhoto = userData.profilePhoto ? userData.profilePhoto?.imageUrl : '';
      done(err, { ...userData._doc, profilePhoto });
    });
  });
});
