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
      phoneNoCountry: inputs.phoneNoCountry,
      phoneCountryCode: inputs.phoneCountryCode,
    });
    if (!users || users.length < 1) {
      return exits.notFound();
    }
    if (users && users.length > 1) {
      sails.log.warn(
        `WARNING - ${users.length} users were found with the same phone number: "+${inputs.phoneCountryCode} ${inputs.phoneNoCountry}"`
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

    if(inputs.email){
      updateParams.email = inputs.email;
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
      sails.log.error(error);
    }

    return exits.success(true);
  },
};

module.exports = _exports;
