import { UserRecord } from 'firebase-admin/auth';
import { UserType } from '../../../scripts/utils';
import * as firebase from '../../../config/firebaseAdmin';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import { SailsActionDefnType } from '../../../scripts/utils';

declare var sails: sailsVegi;

export type ResetPasswordInputs = {
  emailAddress: string;
};

export type ResetPasswordResponse = string | false;

export type ResetPasswordExits = {
  success: (unusedData: ResetPasswordResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  firebaseNoUserExistsForEmail: (unusedErr: Error) => void;
};

const _exports: SailsActionDefnType<
  ResetPasswordInputs,
  ResetPasswordResponse,
  ResetPasswordExits
> = {
  friendlyName: 'ResetPassword',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
    firebaseNoUserExistsForEmail: {
      responseType: 'unauthorised',
      description:
        'A firebase user is already registered to the email requested and should be signed in',
    },
  },

  fn: async function (inputs: ResetPasswordInputs, exits: ResetPasswordExits) {
    try {
      const resetLink = await firebase.sendPasswordResetEmail({tryEmail:inputs.emailAddress});
      const existingFirebaseUser = await firebase.tryGetUser({
        tryEmail: inputs.emailAddress,
        tryPhone: '',
      });
      if(!existingFirebaseUser){
        sails.log.warn(`A user has tried to reset their password for email: "${inputs.emailAddress}" but no firebase account exists for this email.`);
        return exits.success(false);
      }
      return exits.success(resetLink);
    } catch (error) {
      sails.log.error(`${error}`);
      return exits.error(`Unable to reset-password with error: ${error}`);
    }
  },
};

module.exports = _exports;
