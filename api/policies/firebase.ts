import * as admin from 'firebase-admin';

module.exports = async function (req, res, proceed) {
  req.firebase = admin;
  return proceed();
};

