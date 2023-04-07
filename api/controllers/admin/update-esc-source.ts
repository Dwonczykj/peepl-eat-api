import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { SailsActionDefnType } from '../../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';

import { ESCSourceType } from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var ESCSource: SailsModelType<ESCSourceType>;


export type UpdateEscSourceInputs = {
  credibility: number,
  name: string;
  domain?:string;
  type?: ESCSourceType['type'];
};

export type UpdateEscSourceResult = {
  id: number;
} | false;

export type UpdateEscSourceExits = {
  success: (unusedData: UpdateEscSourceResult) => any;
  typeRequired: () => any;
  badTypeArg: (unusedErr?: Error | string) => any;
  badCredibilityArg: (unusedErr?: Error | string) => any;
  error: (unusedErr?: Error | string) => any;
};

const _exports: SailsActionDefnType<
  UpdateEscSourceInputs,
  UpdateEscSourceResult,
  UpdateEscSourceExits
> = {
  friendlyName: 'UpdateEscSource',

  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    credibility: {
      type: 'number',
      required: false,
    },
    domain: {
      type: 'string',
      required: false,
    },
    type: {
      type: 'string',
      required: false,
    },
  },

  exits: {
    success: {
      data: false,
    },
    typeRequired: {
      statusCode: 403,
    },
    badTypeArg: {
      statusCode: 403,
    },
    badCredibilityArg: {
      statusCode: 403,
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: UpdateEscSourceInputs,
    exits: UpdateEscSourceExits
  ) {
    const sources = await ESCSource.find({
      name: inputs.name,
    });
    const checkType = () => {
      return (['database', 'api', 'webpage'].indexOf(inputs.type) > -1);
    };
    const checkCredibilityConstraints = () => {
      return inputs.credibility >= 0 && inputs.credibility <= 1;
    };
    if (!sources || sources.length < 1) {
      if (!inputs.type) {
        return exits.typeRequired();
      }
      if (!checkType()) {
        return exits.badTypeArg();
      }
      else if (!checkCredibilityConstraints()) {
        return exits.badCredibilityArg();
      }
      try {
        const newSource = await ESCSource.create({
          name: inputs.name,
          domain: inputs.domain,
          type: inputs.type,
          credibility: inputs.credibility,
        }).fetch();
        sources.push(newSource);
      } catch (error) {
        return exits.error(error);
      }
    } else {
      if (!checkType()) {
        return exits.badTypeArg();
      } else if (!checkCredibilityConstraints()) {
        return exits.badCredibilityArg();
      }
      try {
        await ESCSource.update({
          name: inputs.name,
        }).set(inputs);
      } catch (error) {
        return exits.error(error);
      }
    }

    return exits.success({
      id: sources[0].id,
    });
  },
};

module.exports = _exports;
