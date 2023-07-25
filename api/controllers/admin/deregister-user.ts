import { Auth, DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
// import * as UserModel from '../../models/UserModel';
import * as firebase from '../../../config/firebaseAdmin';
import { sailsModelKVP, SailsModelType, sailsVegi } from '../../interfaces/iSails';
import { UserType } from '../../../scripts/utils';

declare var User: SailsModelType<UserType>;
declare var sails: sailsVegi;

module.exports = {
  friendlyName: 'Deregister User Vendor Role',

  description:
    'Deregister the role of the user at the vendor they are registered to',

  inputs: {
    id: {
      type: 'string',
      required: false,
    },
    email: {
      type: 'string',
      required: false,
    },
    phoneNumber: {
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
    successJSON: {
      statusCode: 200,
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
    const inputUserId = Number.parseInt(inputs.id);
    const sessionUserId = Number.parseInt(this.req.session.userId);
    const myUser = await User.findOne({
      id: sessionUserId,
    });
    if (!myUser) {
      sails.log.error(`No user found with userId: ${sessionUserId}`);
      return exits.notFound();
    }

    if (sessionUserId !== inputUserId && !myUser.isSuperAdmin){
      sails.log.error(
        `Request to deregister user in unauthorised because ${sessionUserId} !== ${inputUserId} and superAdmin is ${myUser.isSuperAdmin}`
      );
      return exits.unauthorised();
    }

    let user: sailsModelKVP<UserType> | UserType;

    let _phoneNumber: string;
    let _email: string;
    // need this incase its a superadmin deleting another user
    if (Object.keys(inputs).includes('id')) {
      user = await User.findOne({
        id: inputUserId,
      });
      if (!user) {
        return exits.notFound();
      }
      _phoneNumber = `+${user.phoneCountryCode}${user.phoneNoCountry}`;
      _email = user.email;
      // userFB = await auth.getUserByEmail(user.email);
    } else {
      user = myUser;
      // userFB = await auth.getUserByEmail(myUser.email);
      var x = user.phoneNoCountry.toString();
      x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
      x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
      _phoneNumber = `+${user.phoneCountryCode}${x}`;
      _email = user.email;
    }


    try {
      _userRecord = await firebase.getUserByPhone(_phoneNumber);
    } catch (err) {
      sails.log.error(
        `Unable to firebase.getUserByPhone(${_phoneNumber}) from firebase in deregister-user: ${err}`
      );
      sails.log.error(err);

      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }
    sails.log.info(
      `Successfully obtained firebaseUser to deregister with uid: ${_userRecord.uid} and email: ${_userRecord.email} and phone: ${_userRecord.phoneNumber}`
    );
    const userRecord = _userRecord;

    // Signed in
    try {
      await firebase.deleteUser(userRecord.uid);
    } catch (err) {
      sails.log.error(`Unable to delete user from firebase with error: ${err}`);
      sails.log.error(err);
      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      });
      //https://firebase.google.com/docs/reference/js/auth#autherrorcode
    }

    sails.log.info(
      `Successfully deleted firebase user with uid: ${_userRecord.uid} and email: ${_userRecord.email} and phone: ${_userRecord.phoneNumber}`
    );

    try {
      await User.destroy({
        id: user.id,
      });
    } catch (error) {
      sails.log.error(
        `Unable to run destroy command on User with id: ${user.id} from error: ${error}`
      );
    }
    sails.log.info(`Successfully deleted vegi user with id: ${user.id}`);

    try {
      await sails.helpers.sendSmsNotification.with({
        to: _phoneNumber,
        body: `This number has now been removed from vegi's records`,
        data: {},
      });
    } catch (error) {
      sails.log.error(
        `Unable to send deregistration notification to: ${_phoneNumber} for user: ${user.id} with dislay_name: ${user.name}. Error: ${error}`
      );
    }

    try {
      await sails.helpers.sendTemplateEmail.with({
        to: _email,
        subject: `vegi account deletion completed`,
        template: 'email-account-deleted',
        templateData: {
          message: `We have deleted of all of your details at vegi including this email.`,
        },
        layout: false,
      });
    } catch (error) {
      sails.log.error(
        `Unable to send deregistration notification to: ${_email} for user: ${user.id} with dislay_name: ${user.name}. Error: ${error}`
      );
    }

    if (this.res.wantsJson) {
      return exits.successJSON();
    } else {
      return this.res.redirect('/admin/login');
    }
  },
};
