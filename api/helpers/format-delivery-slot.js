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
    var moment = require('moment');

    if (!inputs.value) return '';
    inputs.value = moment.unix(inputs.value).calendar();
    return exits.success(inputs.value);

    // var start = new Date( inputs.deliverySlot.startTime * 1000 );
    // var end = new Date( inputs.deliverySlot.endTime * 1000 );

    // var result = `${ start.toISOString() } ${ end.toISOString() }`;
    // return exits.success( result );
  }


};

