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
  AppLogType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var AppLog: SailsModelType<AppLogType>;


export type ViewAppLogsInputs = {};

export type ViewAppLogsResponse =
  | {
      appLogs: sailsModelKVP<AppLogType>[];
      userRole: number;
    };

export type ViewAppLogsExits = {
  success: (unusedData: ViewAppLogsResponse) => any;
  successJSON: (
    unusedResponse: ViewAppLogsResponse
  ) => ViewAppLogsResponse;
  notFound: () => void;
  issue: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewAppLogsInputs,
  ViewAppLogsResponse,
  ViewAppLogsExits
> = {
  friendlyName: 'ViewAppLogs',

  inputs: {},

  exits: {
    success: {
      data: false,
      viewTemplatePath: 'pages/admin/view-app-logs',
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
    inputs: ViewAppLogsInputs,
    exits: ViewAppLogsExits
  ) {
    const AppLogsUnsorted = await AppLog.find();

    const AppLogs = AppLogsUnsorted.sort((a, b) => {
      return a.timestamp < b.timestamp ? -1 : a.timestamp === b.timestamp ? 0 : 1;
    });

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        appLogs: AppLogs,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        appLogs: AppLogs,
        userRole: this.req.session.userRole,
      });
    }
  },
};

module.exports = _exports;
