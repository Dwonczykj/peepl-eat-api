import { SurveyType } from "scripts/utils";
import { SailsModelType, sailsVegi } from "../../interfaces/iSails";

declare var sails: sailsVegi;
declare var Survey: SailsModelType<SurveyType>;

module.exports = {
  friendlyName: 'Register Email to Waiting List',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
    },
    question: {
      type: 'string',
      required: true,
    },
    answer: {
      type: 'string',
      required: true,
    },
  },

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
    inputs: {
      emailAddress: string;
      question: string;
      answer: string;
    },
    exits: {
      success;
      error;
    }
  ) {
    await Survey.create({
      email: inputs.emailAddress,
      question: inputs.question,
      answer: inputs.answer
    });
    return exits.success();
  },
};
