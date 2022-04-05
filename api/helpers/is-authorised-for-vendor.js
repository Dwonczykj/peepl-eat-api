module.exports = {


  friendlyName: 'Is authorised for vendor',


  description: 'Check if the user is authorised for the vendor.',


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


  fn: async function (inputs) {
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
      return false;
    }

    // check if the user is authorised for the vendor
    if(user.vendor === inputs.vendorId){
      return true;
    }

    return false;
  }


};

