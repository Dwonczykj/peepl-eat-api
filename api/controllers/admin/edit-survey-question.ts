import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { SailsActionDefnType } from '../../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SurveyQuestionType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var SurveyQuestion: SailsModelType<SurveyQuestionType>;


export type EditSurveyQuestionInputs = {
  id?: number | null | undefined;
  question: SurveyQuestionType['question'],
  responseType: SurveyQuestionType['responseType'],
};

export type EditSurveyQuestionResponse = {
  id: number;
} | false;

export type EditSurveyQuestionExits = {
  success: (unusedData: EditSurveyQuestionResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  EditSurveyQuestionInputs,
  EditSurveyQuestionResponse,
  EditSurveyQuestionExits
> = {
  friendlyName: 'EditSurveyQuestion',

  inputs: {
    id: {
      type: 'number',
      required: false,
    },
    question: {
      type: 'string',
      required: true,
    },
    responseType: {
      type: 'string',
      required: true,
      isIn: ['boolean' , ' string' , 'multiline' , 'number'],
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
  },

  fn: async function (
    inputs: EditSurveyQuestionInputs,
    exits: EditSurveyQuestionExits
  ) {
    try {
      if(inputs.id){
        await SurveyQuestion.update(inputs.id).set({
          question: inputs.question,
          responseType: inputs.responseType,
        });
        return exits.success({id: inputs.id});
      } else {
        const newRecord = await SurveyQuestion.create({
          question: inputs.question,
          responseType: inputs.responseType,
        }).fetch();
        return exits.success({id: newRecord.id});
      }
    } catch (error) {
      if(inputs.id){
        return exits.error(`Error updating survey question with id: "${inputs.id}" with error: ${error}`);
      } else {
        return exits.error(`Error creating survey question with error: ${error}`);
      }
    }
  },
};

module.exports = _exports;
