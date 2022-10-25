const isDebugEnv =
  !!process.env.test ||
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'development';
var admin = require('firebase-admin');
var serviceAccount = require('../../config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
if (isDebugEnv) {
  admin.initializeApp({ projectId: 'vegiliverpool' });
  // eslint-disable-next-line no-console
  console.log('RUNNING APP IN DEBUG MODE VS FIREBASE EMULATOR');
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async function (req, res, proceed) {
  req.firebase = admin;
  proceed();
};

