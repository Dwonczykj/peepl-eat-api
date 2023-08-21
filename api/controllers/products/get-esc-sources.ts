import { ESCSourceType, SailsActionDefnType } from '../../../scripts/utils';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';


declare var ESCSource: SailsModelType<ESCSourceType>;
declare var sails: sailsVegi;

export type GetESCSourcesInputs = {
  type?: ESCSourceType['type'] | null | '';
};

export type GetESCSourcesResult = sailsModelKVP<ESCSourceType>[];

export type GetESCSourcesExits = {
  success: (unusedData: GetESCSourcesResult | null) => any;
  notFound: (unusedErr?:Error|string) => any;
};

const _exports: SailsActionDefnType<
  GetESCSourcesInputs,
  GetESCSourcesResult,
  GetESCSourcesExits
> = {
  friendlyName: 'Get esc source',

  description:
    'Get the options for the source as well as the relevant options.',

  inputs: {
    type: {
      type: 'string',
      description: 'The type of sources to filter for',
      required: false,
    },
  },

  exits: {
    success: {
      data: null,
    },
    notFound: {
      // message: 'Product not found for public id',
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: GetESCSourcesInputs,
    exits: GetESCSourcesExits
  ) {
    var sources: sailsModelKVP<ESCSourceType>[];
    if (inputs.type === ""){
      sources = await ESCSource.find({});
    } else {
      sources = await ESCSource.find({
        type: inputs.type,
      });
    }
    
    return exits.success(sources);
  },
};  

module.exports = _exports;
