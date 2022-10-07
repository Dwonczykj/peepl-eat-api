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
        return exits.notFound();
      }
      // userFB = await auth.getUserByEmail(user.email);
      userFB = await auth.getUserByPhoneNumber(user.phoneNumber);
    } else {
      user = myUser;
      // userFB = await auth.getUserByEmail(myUser.email);
      var x = user.phoneNoCountry.toString();
      x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
      x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
      userFB = await auth.getUserByPhoneNumber(`+${user.phoneCountryCode} ${x}`);
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
