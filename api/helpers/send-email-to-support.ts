import { sailsVegi } from "api/interfaces/iSails";

declare var sails: sailsVegi;

export type SendEmailToSupportInputs = {
  subject: string;
  message: string;
  additionalInfo?: string | null | undefined;
};

module.exports = {
  friendlyName: 'Send an internal email to vegi support',

  inputs: {
    subject: {
      type: 'string',
      description: 'Email Subject',
      required: true,
    },
    message: {
      type: 'string',
      required: true,
    },
    additionalInfo: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      data: null,
    },
    error: {
      description: 'partial fulfilment creation in db failed',
      data: null,
      error: null,
    },
  },

  fn: async function (
    inputs: SendEmailToSupportInputs,
    exits: {
      success: () => void;
      error: (unusedError: Error) => void;
    }
  ) {
    try {
      await sails.helpers.sendTemplateEmail.with({
        template: 'email-support-internal',
        templateData: {
          message: inputs.message,
          additionalInfo: inputs.additionalInfo,
        },
        subject: inputs.subject,
        to: 'support@vegiapp.co.uk',
        layout: false,
      });
    } catch (error) {
      sails.log.error(
        `There was an error sending an internal email from vegi server to support: ${error}`
      );
    }
    return exits.success();
  },
};
