//~ https://dev-bay.com/firebase-integrate-admin-sdk-with-nodejs-back-end-api/
import * as admin from 'firebase-admin';
import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';

if(process.env.NODE_ENV === 'test' || process.env.useFirebaseEmulator === 'true'){
  admin.initializeApp({ projectId: 'vegiliverpool' });
} else {
  const serviceAccount = require('./vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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

export const getUser = (phoneNumber:string): Promise<UserRecord> => {
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
