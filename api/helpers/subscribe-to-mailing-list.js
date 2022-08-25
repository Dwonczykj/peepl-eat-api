/* eslint-disable camelcase */
var mailchimp = require('@mailchimp/mailchimp_marketing');
var md5 = require('md5');
module.exports = {


  friendlyName: 'Subscribe to mailing list',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    mailchimp.setConfig({
      apiKey: sails.config.custom.mailchimpAPIKey,
      server: 'us7'
    });

    var customerEmailMd5 = md5(inputs.emailAddress.toLowerCase());
    var listId = sails.config.custom.mailchimpListId;

    mailchimp.lists.setListMember(listId, customerEmailMd5, {
      email_address: inputs.emailAddress,
      status_if_new: 'subscribed',
      // merge_fields: {
      //   FNAME: inputs.address.name,
      //   POSTCODE: inputs.address.postCode
      // }
    })
    .catch((err) => {
      sails.log.warn(err);
    });
  }


};

