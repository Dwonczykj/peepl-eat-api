import { sailsVegi } from "../../interfaces/iSails";

declare var sails: sailsVegi;

export type GetSurveyQuestionsSuccess = {
  question: string;
  responseType: 'boolean' | 'string' | 'number';
}[];

module.exports = {
  friendlyName: 'Get Survey Questions',

  inputs: {},

  exits: {
    success: {
      outputDescription: '',
      outputExample: {},
      data: null,
    },
    error: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: {},
    exits: {
      success: (
        unusedArg: GetSurveyQuestionsSuccess
      ) => GetSurveyQuestionsSuccess;
      error: (unusedErr?:Error) => void;
    }
  ) {
    return exits.success(sails.config.custom.surveyQuestions || []);
  },
};
