import { getAuth, UserRecord } from 'firebase-admin/auth';
// import * as UserModel from '../../models/UserModel';

module.exports = {


  friendlyName: 'Deregister User Vendor Role',


  description: 'Deregister the role of the user at the vendor they are registered to',


  inputs: {
    id: {
      type: 'string',
      required: false
    }
  },


  exits: {
    success: {
      outputDescription: '`User`s vendor role has been successfully deregisterd.',
      outputExample: {}
    },
    badRequest: {
      description: 'User id passed does not exist.',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no user with that ID!',
      responseType: 'notFound'
    },
    unauthorised: {
      description: 'You are not authorised to have a role with this vendor.',
      responseType: 'unauthorised'
    },
  },


  fn: async function (inputs, exits) {

    const auth = getAuth();

    const myUser = User.findOne({
      id: this.req.session.userId
    });

    let user: any;
    let userFB: UserRecord;

    if (Object.keys(inputs).includes('id')) {
      user = User.findOne({
        id: inputs.id
      });
      if (!user) {
        throw 'notFound';
      }
      userFB = await auth.getUserByEmail(user.email);
    } else {
      user = myUser;
      userFB = await auth.getUserByEmail(myUser.email);
    }

    delete this.req.session.userId;
    return auth.deleteUser(userFB.uid).then(() => {
      // return deleteUser(userFB).then(() => {
      return User.deleteOne({
        email: user.email
      });
    }).catch((error) => {
      throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }).finally(() => {
      return this.res.redirect('/admin/login');
    });

  }


};
