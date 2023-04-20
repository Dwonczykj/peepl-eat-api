import {
  sailsModelKVP,
  SailsModelType,
  
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  SurveyQuestionType,
  UserType
} from '../../../scripts/utils';

declare var SurveyQuestion: SailsModelType<SurveyQuestionType>;


export type ViewSurveyQuestionsInputs = {};

export type ViewSurveyQuestionsResponse = {
  SurveyQuestions: sailsModelKVP<SurveyQuestionType>[],
  userRole: UserType['role'],
} | false;

export type ViewSurveyQuestionsExits = {
  success: (unusedData: ViewSurveyQuestionsResponse) => any;
  successJSON: (
    unusedResponse: ViewSurveyQuestionsResponse
  ) => ViewSurveyQuestionsResponse;
  notFound: () => void;
  issue: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewSurveyQuestionsInputs,
  ViewSurveyQuestionsResponse,
  ViewSurveyQuestionsExits
> = {
  friendlyName: 'ViewSurveyQuestions',

  inputs: {
    
  },

  exits: {
    success: {
      data: false,
      viewTemplatePath: 'pages/admin/view-survey-questions',
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
    inputs: ViewSurveyQuestionsInputs,
    exits: ViewSurveyQuestionsExits
  ) {
    var surveyQuestionssUnsorted = await SurveyQuestion.find();

    const surveyQuestions = surveyQuestionssUnsorted.sort((a, b) => {
      return a.id - b.id;
    });

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        SurveyQuestions: surveyQuestions,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        SurveyQuestions: surveyQuestions,
        userRole: this.req.session.userRole,
      });
    }
  },
};

module.exports = _exports;
