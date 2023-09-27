import {
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  UserType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;


export type UpdateUserSelfInputs = {
  userId: number;
  phoneNoCountry: string;
  phoneCountryCode: number;
  email?: string | undefined;
  name?: string | undefined;
  marketingEmailContactAllowed?: boolean | undefined;
  marketingPhoneContactAllowed?: boolean | undefined;
  marketingPushContactAllowed?: boolean | undefined;
};

export type UpdateUserSelfResponse = boolean;

export type UpdateUserSelfExits = {
  success: (unusedData: UpdateUserSelfResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  notAuthorised: () => void;
};

const _exports: SailsActionDefnType<
  UpdateUserSelfInputs,
  UpdateUserSelfResponse,
  UpdateUserSelfExits
> = {
  friendlyName: 'SetRandomAvatar',

  inputs: {
    userId: {
      type: 'number',
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
    email: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: false,
    },
    marketingEmailContactAllowed: {
      type: 'boolean',
      required: false,
    },
    marketingPhoneContactAllowed: {
      type: 'boolean',
      required: false,
    },
    marketingPushContactAllowed: {
      type: 'boolean',
      required: false,
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    notAuthorised: {
      statusCode: 401,
      responseType: 'unauthorised',
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
  },

  fn: async function (
    inputs: UpdateUserSelfInputs,
    exits: UpdateUserSelfExits
  ) {
    const users = await User.find({
      id: inputs.userId,
      // phoneNoCountry: inputs.phoneNoCountry,
      // phoneCountryCode: inputs.phoneCountryCode,
    });
    if (!users || users.length < 1) {
      return exits.notFound();
    }
    if (users && users.length > 1) {
      sails.log.warn(
        `WARNING - ${users.length} users were found with id: [${inputs.userId}] and with the same phone number: "+${inputs.phoneCountryCode} ${inputs.phoneNoCountry}"`
      );
    }
    const user = users[0];
    // * default to first user
    // * check that the currently logged in user is this user
    if (this.req.session.userId !== user.id) {
      return exits.notAuthorised();
    }
    type updateParamsType = {
      [key in keyof UserType]?: UserType[key];
    };
    var updateParams: updateParamsType = {};

    if(inputs.email && inputs.email.trim().toLowerCase() !== user.email.toLowerCase()){
      const _existingUserSameEmail = await User.find({
        email: inputs.email.trim().toLowerCase(),
      });
      if(_existingUserSameEmail && _existingUserSameEmail.length > 0){
        const _first = _existingUserSameEmail[0];
        sails.log.error(`Unable to update user[${user.id}]'s email as another user[${_first.id}] already has email "${inputs.email}"`);
        return exits.badRequest(
          `Unable to update user[${user.id}]'s email as another user[${_first.id}] already has email "${inputs.email}"`
        );
      }
      updateParams.email = inputs.email;
      if (!updateParams.email.includes('@')){
        return exits.badRequest('bad email passed');
      }
      if(user.name === user.phoneNoCountry && !user.email && !inputs.name){
        const proxyName = updateParams.email.substring(0, updateParams.email.indexOf('@'));
        updateParams.name = proxyName;
      }
    }
    if(inputs.name){
      updateParams.name = inputs.name;
    }
    if(Object.keys(inputs).includes('marketingEmailContactAllowed')){
      updateParams.marketingEmailContactAllowed = inputs.marketingEmailContactAllowed;
    }
    if(Object.keys(inputs).includes('marketingPhoneContactAllowed')){
      updateParams.marketingPhoneContactAllowed = inputs.marketingPhoneContactAllowed;
    }
    if(Object.keys(inputs).includes('marketingPushContactAllowed')){
      updateParams.marketingPushContactAllowed = inputs.marketingPushContactAllowed;
    }

    try {
      await User.updateOne({id: user.id}).set(updateParams);
    } catch (error) {
      sails.log.error(`Failed to update user's own details with error: ${error}`);
      sails.log.error(`${error}`);
    }

    return exits.success(true);
  },
};

module.exports = _exports;
