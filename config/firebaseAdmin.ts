//~ https://dev-bay.com/firebase-integrate-admin-sdk-with-nodejs-back-end-api/
import * as admin from 'firebase-admin';
import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import fs from 'fs';

if(process.env.NODE_ENV === 'test' || process.env.useFirebaseEmulator === 'true'){
  admin.initializeApp({ projectId: 'vegiliverpool' });
} else {
  const fpath = 'vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json';
  if (!fs.existsSync(`./${fpath}`)) {
    if (process.env[fpath]) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env[fpath], 'base64').toString()
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      throw Error(`No env variables is set for "firebase-adminsdk"`);
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
