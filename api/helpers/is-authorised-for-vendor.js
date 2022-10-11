module.exports = {


  friendlyName: 'Is authorised for vendor',


  description: 'Check if the user is a vendor User registered to this vendor or is a superadmin',


  inputs: {
    userId: {
      type: 'number',
      required: true,
      description: 'The id of the user.',
    },
    vendorId: {
      type: 'number',
      required: true,
      description: 'The id of the vendor.',
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // get the user
    const user = await User.findOne({
      id: inputs.userId,
    });

    if(user.isSuperAdmin){
      return true;
    }

    let vendor = await Vendor.findOne({
      id: inputs.vendorId,
    });

    if(!vendor){
      sails.log.info(`Not authorised to view vendor route`);
      return false;
    }

    // check if the user is authorised for the vendor
    if(user.vendor === inputs.vendorId){
      return true;
    }
    sails.log.info(`Not authorised to view vendor route`);
    return false;
  }


};

