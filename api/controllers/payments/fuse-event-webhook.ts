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
import { FuseEventGeneric } from '../../../fuse/fuseApi';

declare var sails: sailsVegi;


export type FuseEventWebhookInputs = FuseEventGeneric & {
  
}

export type FuseEventWebhookResponse = boolean;

export type FuseEventWebhookExits = {
  success: (unusedData: FuseEventWebhookResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  FuseEventWebhookInputs,
  FuseEventWebhookResponse,
  FuseEventWebhookExits
> = {
  friendlyName: 'FuseEventWebhook',

  inputs: {
    
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
  },

  fn: async function (
    inputs: FuseEventWebhookInputs,
    exits: FuseEventWebhookExits
  ) {
    

    return exits.success(ResponseFinal);
  },
};

module.exports = _exports;
