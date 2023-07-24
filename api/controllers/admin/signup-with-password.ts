import { UserRecord } from 'firebase-admin/auth';
import { UserType } from '../../../scripts/utils';
import * as firebase from '../../../config/firebaseAdmin';
import { SailsModelType } from '../../../api/interfaces/iSails';
declare var User: SailsModelType<UserType>;
// const bcrypt = require('bcrypt');
module.exports = {
  friendlyName: 'Registration with email and password',

  description: 'Registration administration.',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    phoneNoCountry: {
      type: 'string',
      required: true,
    },
    phoneCountryCode: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
    },
    vendorId: {
      type: 'number',
      allowNull: true,
    },
    deliveryPartnerId: {
      type: 'number',
      allowNull: true,
    },
    role: {
      type: 'string',
    },
    vendorRole: {
      type: 'string',
      defaultsTo: 'none',
    },
    deliveryPartnerRole: {
      type: 'string',
      defaultsTo: 'none',
    },
  },

  exits: {
    FirebaseError: {
      responseType: 'unauthorised',
    },
    userExists: {
      responseType: 'unauthorised',
      description: 'A user is already registered to the details requested',
    },
    firebaseUserExistsForPhone: {
      responseType: 'unauthorised',
      description:
        'A firebase user is already registered to the phonenumber requested and should be signed in',
    },
    firebaseUserExistsForEmail: {
      responseType: 'unauthorised',
      description:
        'A firebase user is already registered to the email requested and should be signed in',
    },
    badRolesRequest: {
      responseType: 'badRequest',
      statusCode: 403,
      message: 'Bad Roles Supplied to request',
      description:
        'Register request passed with string roles that do not exist on the roles/vendorRoles/deliveryPartnerRoles of a User',
    },
    success: {
      outputDescription: '',
      outputExample: {},
      data: null,
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 400,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
    error: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: {
      emailAddress: string;
      password: string;
      phoneNoCountry: string;
      phoneCountryCode: number;
      name?: string;
      vendorId?: number;
      deliveryPartnerId?: number;
      role: string;
      vendorRole?: string;
      deliveryPartnerRole?: string;
    },
    exits: {
      firebaseErrored;
      firebaseUserExistsForPhone;
      firebaseUserExistsForEmail;
      success;
      badRolesRequest;
      userExists;
      error;
    }
  ) {
    if (
      !['admin', 'owner', 'inventoryManager', 'salesManager', 'none'].includes(
        inputs.vendorRole
      )
    ) {
      return exits.badRolesRequest({
        message: 'Bad vendorRole Supplied to request',
      });
    }
    if (
      !['admin', 'owner', 'deliveryManager', 'rider', 'none'].includes(
        inputs.deliveryPartnerRole
      )
    ) {
      return exits.badRolesRequest({
        message: 'Bad deliveryPartnerRole Supplied to request',
      });
    }
    if (
      !['admin', 'vendor', 'deliveryPartner', 'consumer'].includes(inputs.role)
    ) {
      return exits.badRolesRequest({
        message: 'Bad role Supplied to request',
      });
    }

    const existingFirebaseUser = await firebase.tryGetUser({
      tryEmail: inputs.emailAddress.trim().toLowerCase(),
      tryPhone: `+${inputs.phoneCountryCode}${inputs.phoneNoCountry}`,
    });

    const existingSailsUser = await User.findOne({
      or: [
        {
          phoneNoCountry: inputs.phoneNoCountry,
          phoneCountryCode: inputs.phoneCountryCode,
        },
        {
          email: inputs.emailAddress.trim().toLowerCase(),
        },
      ],
    });

    var _userRecord: UserRecord;

    if (existingFirebaseUser && existingSailsUser) {
      if (existingFirebaseUser.email === inputs.emailAddress) {
        return exits.firebaseUserExistsForEmail();
      } else if (
        existingFirebaseUser.phoneNumber ===
        `+${inputs.phoneCountryCode}${inputs.phoneNoCountry}`
      ) {
        sails.log.warn(
          `Failed to register new user for email: "${inputs.emailAddress}" as phoneNumber:+${inputs.phoneCountryCode}${inputs.phoneNoCountry} is already registered to email: "${existingFirebaseUser.email}" with firebase. https://console.firebase.google.com/u/0/project/vegiliverpool/authentication/users We will send a password reset email request`
        );
        if(existingFirebaseUser.email){
          await firebase.sendPasswordResetEmail({
            tryEmail: existingFirebaseUser.email,
          });
        }
        return exits.firebaseUserExistsForPhone();
      }
      return exits.userExists();
    }

    if (!existingFirebaseUser) {
      try {
        _userRecord = await firebase.createUser({
          email: inputs.emailAddress,
          password: inputs.password,
          name: inputs.name,
          phoneNumber: `+${inputs.phoneCountryCode}${inputs.phoneNoCountry}`,
        });
        sails.log.verbose(
          `Created user in firebase for email: "${inputs.emailAddress} and phone:+${inputs.phoneCountryCode}${inputs.phoneNoCountry}"`
        );
      } catch (err) {
        sails.log.error(`Firebase Errored on User_Creation with code: ${err.code} because: "${err.message}"`);

        return exits.firebaseErrored({
          code: err.code,
          message: err.message,
          error: err,
        }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      }
      // Signed in
      const fbUser = _userRecord;
      if (!existingSailsUser) {
        try {
          // * Create User Wrapper
          const user = await User.create({
            phoneNoCountry: inputs.phoneNoCountry,
            phoneCountryCode: inputs.phoneCountryCode,
            email: inputs.emailAddress,
            name: inputs.name,
            vendor: inputs.vendorId,
            deliveryPartner: inputs.deliveryPartnerId,
            vendorConfirmed: false,
            isSuperAdmin: false,
            vendorRole: inputs.vendorRole ?? 'none',
            deliveryPartnerRole: inputs.deliveryPartnerRole ?? 'none',
            role: inputs.role,
            // firebaseSessionToken: `DUMMY_SIGNUP_${fbUser.uid}`, //! Set when they log in not here!
            fbUid: fbUser.uid,
          }).fetch();
          sails.log.verbose(
            `Created user in vegi DB for email: "${inputs.emailAddress} and phone:+${inputs.phoneCountryCode}${inputs.phoneNoCountry}"`
          );
          return exits.success(user);
        } catch (error) {
          sails.log.error(error);
          sails.log.error(
            `Error creating user in signup-with-password action: ${error}`
          );
          return exits.error(
            new Error(
              `Error creating user in signup-with-password action: ${error}`
            )
          );
        }
      } else {
        await User.updateOne(existingSailsUser.id).set({
          fbUid: fbUser.uid,
        });
        const user = await User.findOne(existingSailsUser.id);
        return exits.success(user);
      }
    } else {
      // If User has account (in firebase) then that is a vegi account and they should use it to login:
      if(!existingSailsUser){
        try {
          const user: UserType = await User.create({
            phoneNoCountry: inputs.phoneNoCountry,
            phoneCountryCode: inputs.phoneCountryCode,
            email: inputs.emailAddress,
            name: inputs.name,
            vendor: inputs.vendorId,
            deliveryPartner: inputs.deliveryPartnerId,
            vendorConfirmed: false,
            isSuperAdmin: false,
            vendorRole: inputs.vendorRole ?? 'none',
            deliveryPartnerRole: inputs.deliveryPartnerRole ?? 'none',
            role: inputs.role,
          }).fetch();
          sails.log.verbose(
            `Created user in vegi DB for email: "${inputs.emailAddress} and phone:+${inputs.phoneCountryCode}${inputs.phoneNoCountry}"`
          );
          return exits.success(user);
        } catch (error) {
          sails.log.error(
            `Error creating user in signup-with-password action: ${error}`
          );
          sails.log.error(error);
          // return exits.error(
          //   new Error(
          //     `Error creating user in signup-with-password action: ${error}`
          //   )
          // );
        }
      }
      if(existingFirebaseUser.email === inputs.emailAddress){
        sails.log.verbose(
          `Signup result, user created but firebase account already found for email: ${inputs.emailAddress}"`
        );
        return exits.firebaseUserExistsForEmail();
      } else {
        sails.log.verbose(
          `Signup result, user created but firebase account already found for phone: +${inputs.phoneCountryCode}${inputs.phoneNoCountry}"`
        );
        return exits.firebaseUserExistsForPhone();
      }
    }

    
  },
};
