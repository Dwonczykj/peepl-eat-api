import {
  WaitingListEntryType,
  SailsActionDefnType,
} from '../../../scripts/utils'; 
import { sailsVegi, SailsModelType } from '../../interfaces/iSails';
declare var sails: sailsVegi;
declare var WaitingList: SailsModelType<WaitingListEntryType>;

type OnboardUserEmailInputs = {
  email: WaitingListEntryType['email'];
  onboarded: WaitingListEntryType['onboarded'];
};

type OnboardUserEmailResult = { updatedWaitingListId: number };
type OnboardUserEmailExits = {
  success: (unusedArg: OnboardUserEmailResult) => any;
  badRequest: (unusedArg?: any) => void;
  notFound: () => void;
  unauthorised: () => void;
};

const _exports: SailsActionDefnType<
  OnboardUserEmailInputs,
  OnboardUserEmailResult,
  OnboardUserEmailExits
> = {
  friendlyName: 'onboard user email from waitinglist',

  description:
    'Flag a users email as having been onboarded',

  inputs: {
    email: {
      type: 'string',
      required: true,
    },
    onboarded: {
      type: 'boolean',
      required: true,
    },
  },

  exits: {
    success: {},
    badRequest: {
      description: 'Bad email addressed',
      message: 'Bad email addressed',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no waiting list entry with that email address',
      message: 'There is no waiting list entry with that email address',
      responseType: 'notFound',
    },
    unauthorised: {
      responseType: 'unauthorised',
    },
  },

  fn: async function (inputs, exits) {
    const existingWaitingListEntry = await WaitingList.findOne({
      email: inputs.email,
    });
    let result: OnboardUserEmailResult = {
      updatedWaitingListId: null,
    };
    if (!existingWaitingListEntry) {
      return exits.notFound();
    } else {
      await WaitingList.update({
        onboarded: inputs.onboarded,
        email: inputs.email,
      });
      result = {
        updatedWaitingListId: existingWaitingListEntry.id,
      };
    }

    // All done.
    return exits.success(result);
  },
};

module.exports = _exports;
