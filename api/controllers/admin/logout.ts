import { getAuth, signOut } from "firebase/auth";
module.exports = {


  friendlyName: 'Logout',


  description: 'Logout admin.',


  inputs: {

  },


  exits: {
    success: {

    },
  },


  fn: async function (inputs, exits) {
    delete this.req.session.userId;

    const auth = getAuth();
    return signOut(auth).then(() => {
      return;
    }).catch((error) => {
      throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }).finally(() => {
      return this.res.redirect('/admin/login');
    });
  }


};
