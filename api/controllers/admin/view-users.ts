import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  UserType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;


export type ViewUsersInputs = {};

export type ViewUsersResponse = {
  users: sailsModelKVP<UserType>[];
  userRole: number;
};

export type ViewUsersExits = {
  success: (unusedData: ViewUsersResponse) => any;
  successJSON: (
    unusedResponse: ViewUsersResponse
  ) => ViewUsersResponse;
  notFound: () => void;
  issue: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewUsersInputs,
  ViewUsersResponse,
  ViewUsersExits
> = {
  friendlyName: 'ViewUsers',

  inputs: {},

  exits: {
    success: {
      data: false,
      viewTemplatePath: 'pages/admin/view-users',
    },
    successJSON: {
      statusCode: 200,
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
  },

  fn: async function (
    inputs: ViewUsersInputs,
    exits: ViewUsersExits
  ) {
    var UsersUnsorted = await User.find();

    const Users = UsersUnsorted.sort((a, b) => {
      return (
        a.email.localeCompare(b.email) ||
        a.name.localeCompare(b.name)
      );
    });

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        users: Users,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        users: Users,
        userRole: this.req.session.userRole,
      });
    }
  },
};

module.exports = _exports;
