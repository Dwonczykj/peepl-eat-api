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
} from '../../../scripts/utils';

declare var sails: sailsVegi;


export type GetConfigDetailsInputs = {};

export type GetConfigDetailsResponse = {
  databaseUrl: string;
  databaseSailsAdapter: string;
  webserverHostName: string;
  environment: string;
} | false;

export type GetConfigDetailsExits = {
  success: (unusedData: GetConfigDetailsResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetConfigDetailsInputs,
  GetConfigDetailsResponse,
  GetConfigDetailsExits
> = {
  friendlyName: 'GetConfigDetails',

  inputs: {},

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
  },

  fn: async function (
    inputs: GetConfigDetailsInputs,
    exits: GetConfigDetailsExits
  ) {
    const dbConn: GetConfigDetailsResponse = {
      databaseSailsAdapter: sails.config.datastores.default.adapter,
      databaseUrl:
        sails.config.datastores.default.url || process.env.LOCAL_DATABASE_URL,
      webserverHostName: sails.config.custom.baseUrl,
      environment: process.env.NODE_ENV,
    };

    return exits.success(dbConn);
  },
};

module.exports = _exports;
