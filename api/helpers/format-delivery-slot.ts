module.exports = {

  friendlyName: 'Format delivery slot',

  description: '',

  sync: true,

  inputs: {
    // deliverySlot: {
    //   type: 'ref',
    //   example: 1,
    //   description: 'An onject with startTime and endTime properties',
    //   required: true,
    // },
    value:{
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: function (inputs, exits) {
    const moment = require('moment');

    if (!inputs.value) {
      return exits.success('');
    }
    inputs.value = moment.unix(inputs.value).calendar(null, {
      lastDay: '[Yesterday]',
      // sameDay: '[Today]',
      sameDay: function (now) {
        if (this.isBefore(now)) {
          return '[Will Happen Today]';
        } else {
          return '[Happened Today]';
        }
      },
      nextDay: '[Tomorrow]',
      lastWeek: '[last] dddd',
      nextWeek: 'dddd',
      sameElse: 'DD/MM/YYYY', // ~ https://momentjs.com/docs/#/displaying/calendar-time/
    }); // ~ https://stackoverflow.com/a/41260094
    return exits.success(inputs.value);

    // var start = new Date( inputs.deliverySlot.startTime * 1000 );
    // var end = new Date( inputs.deliverySlot.endTime * 1000 );

    // var result = `${ start.toISOString() } ${ end.toISOString() }`;
    // return exits.success( result );
  }

};
