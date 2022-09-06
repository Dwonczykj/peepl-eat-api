module.exports = {


  friendlyName: 'Logout',


  description: 'Logout admin.',


  inputs: {

  },


  exits: {
    success: {

    },
    FirebaseError:{
      code: null,
      message: 'firebase error message placeholder'
    }
  },


  fn: async function (inputs, exits) {
    delete this.req.session.userId;

    //* Not signed into Firebase on backend, only on vue client -> signout there
    // const auth = getAuth();
    // return signOut(auth).then(() => {
    //   return;
    // }).catch((error) => {
    //   exits.FirebaseError({code: error.code, message: error.message}); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    // }).finally(() => {
    //   return this.res.redirect('/admin/login');
    // });
  }


};
