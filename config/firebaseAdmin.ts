//~ https://dev-bay.com/firebase-integrate-admin-sdk-with-nodejs-back-end-api/
import * as admin from 'firebase-admin';
import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import fs from 'fs';

let config = {
  baseUrl:
    process.env.NODE_ENV === 'production'
      ? process.env.STAGE_ENV === 'QA'
        ? 'https://qa-vegi.vegiapp.co.uk'
        : 'https://vegi.vegiapp.co.uk'
      : `http://localhost:${process.env.PORT}`,
};
if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(`Loading config from local env vars for config/firebaseAdmin.ts`);
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64').toString()
  );
  config = localConfigFromDotEnv.config.custom;
}


const kebabize = (str, forceJoinerStr = '-') =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? forceJoinerStr || '-' : '') + $.toLowerCase()
  );

function strToEnvKey(str) {
  return kebabize(str.replace(/\.[^/.]+$/, '')).replace(/-/g, '_');
}

if(process.env.NODE_ENV === 'test' || process.env.useFirebaseEmulator === 'true'){
  admin.initializeApp({ projectId: 'vegiliverpool' });
} else {
  const fpath = 'vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json';
  if (!fs.existsSync(`./${fpath}`)) {
    if (
      process.env[strToEnvKey(fpath)] ||
      process.env[fpath]
    ) {
      const serviceAccount = JSON.parse(
        Buffer.from(
          process.env[strToEnvKey(fpath)] || process.env[fpath],
          'base64'
        ).toString()
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      const envVariables = JSON.stringify(Object.keys(process.env).sort());
      throw Error(
        `No env variable is set for "firebase-adminsdk". process.env="${envVariables}"`
      );
    }
  } else {
    const serviceAccount = require(`./${fpath}`);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const verifyIdToken = (idToken: string): Promise<DecodedIdToken> => {
  return new Promise(async (resolve, reject) => {
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      resolve(decodedToken);
    } catch (err) {
      reject(err);
    }
  });
};

export const createUser = (args:{email:string, phoneNumber:string, password:string, name?:string}): Promise<UserRecord> => {
  // ! phone nuber must be in format: https://www.twilio.com/docs/glossary/what-e164
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = await getAuth().createUser({
        email: args.email,
        phoneNumber: args.phoneNumber,
        password: args.password,
        displayName: args.name || args.email,
      });
      resolve(userRecord);
    } catch (err) {
      reject(err);
    }
  });
};
export const updateUser = (userFbUid:string, args:{email:string, password?:string, name?:string}): Promise<UserRecord> => {
  // ! phone nuber must be in format: https://www.twilio.com/docs/glossary/what-e164
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = await getAuth().updateUser(
        userFbUid,
        args.password
          ? {
            email: args.email,
            // phoneNumber: args.phoneNumber,
            password: args.password,
            displayName: args.name || args.email,
          }
          : {
            email: args.email,
            // phoneNumber: args.phoneNumber,
            displayName: args.name || args.email,
          }
      );
      resolve(userRecord);
    } catch (err) {
      reject(err);
    }
  });
};

export const getUserByPhone = (phoneNumber:string): Promise<UserRecord> => {
  // ! phone nuber must be in format: https://www.twilio.com/docs/glossary/what-e164
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = await getAuth().getUserByPhoneNumber(phoneNumber);
      resolve(userRecord);
    } catch (err) {
      reject(err);
    }
  });
};

export const getUserByEmail = (email:string): Promise<UserRecord> => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = await getAuth().getUserByEmail(email);
      resolve(userRecord);
    } catch (err) {
      reject(err);
    }
  });
};

export const sendPasswordResetEmail = (args = {
  tryEmail: '',
}): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (args.tryEmail) {
      try {
        const resetLink = await getAuth()
          .generatePasswordResetLink(args.tryEmail, {
            url: process.env.NODE_ENV === 'production'
              ? 'https://vegi.vegiapp.co.uk' 
              : 'https://qa-vegi.vegiapp.co.uk',
            // iOS: {
            //   bundleId: 'com.example.ios'
            // },
            // android: {
            //   packageName: 'com.example.android',
            //   installApp: true,
            //   minimumVersion: '12'
            // },
            handleCodeInApp: false,
            // dynamicLinkDomain: 'custom.page.link'
          })
          .then((link) => {
            return link;
          })
          .catch((error) => {
            // Some error occurred, you can inspect the code: error.code
            return reject(error);
          });
        return resetLink && resolve(resetLink);
      } catch (err) {
        return reject(err);
      }
    }
    
  });
}

export const tryGetUser = (args = {
  tryEmail: '',
  tryPhone: '',
}): Promise<UserRecord> => {
  return new Promise(async (resolve, unusedReject) => {
    let userRecord: UserRecord;
    if(args.tryPhone){
      try {
        userRecord = await getAuth().getUserByPhoneNumber(args.tryPhone);
        return resolve(userRecord);
      } catch (unusedErr) {
        // reject(err);
      }
    }
    if(!userRecord && args.tryEmail){
      try {
        userRecord = await getAuth().getUserByEmail(args.tryEmail);
        return resolve(userRecord);
      } catch (unusedErr) {
        // reject(err);
      }
    }
    resolve(userRecord);
  });
};

export const deleteUser = (uid:string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await getAuth().deleteUser(uid);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
