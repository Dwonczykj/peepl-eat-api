import { Auth, DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
// import * as UserModel from '../../models/UserModel';
import * as firebase from '../../../config/firebaseAdmin';

module.exports = {
  friendlyName: 'Deregister User Vendor Role',

  description:
    'Deregister the role of the user at the vendor they are registered to',

  inputs: {
    id: {
      type: 'string',
      required: false,
    },
  },

  exits: {
    success: {
      outputDescription:
        '`User`s vendor role has been successfully deregistered.',
      outputExample: {},
    },
    badRequest: {
      description: 'User id passed does not exist.',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no user with that ID!',
      responseType: 'notFound',
    },
    unauthorised: {
      description: 'You are not authorised to have a role with this vendor.',
      responseType: 'unauthorised',
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 401,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
  },

  fn: async function (inputs, exits) {
    var _userRecord: UserRecord;
    const myUser = await User.findOne({
      id: this.req.session.userId,
    });
    if(!myUser){
      return exits.notFound();
    }

    let user: any;

    let _phoneNumber: string;
    if (Object.keys(inputs).includes('id')) {
      user = await User.findOne({
        id: inputs.id,
      });
      if (!user) {
        return exits.notFound();
      }
      _phoneNumber = user.phoneNumber;
      // userFB = await auth.getUserByEmail(user.email);
    } else {
      user = myUser;
      // userFB = await auth.getUserByEmail(myUser.email);
      var x = user.phoneNoCountry.toString();
      x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
      x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
      _phoneNumber = `+${user.phoneCountryCode}${x}`;
    }

    const userRecord = _userRecord;

    try {
      _userRecord = await firebase.getUserByPhone(_phoneNumber);
    } catch (err) {
      sails.log.error(err);

      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }

    // Signed in

    return firebase
      .deleteUser(userRecord.uid)
      .then(() => {
        // return deleteUser(userFB).then(() => {
        return User.deleteOne({
          email: user.email,
        });
      })
      .catch((error) => {
        throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      })
      .finally(() => {
        return this.res.redirect('/admin/login');
      });
  },
};
