module.exports = {


  friendlyName: 'Create delivery partner',


  description: '',


  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'The name of the delivery partner',
      maxLength: 50
    },
    email:{
      type: 'string',
      required: true,
      description: 'The email address of the delivery partner',
      maxLength: 50,
      isEmail: true
    },
    phoneNumber: {
      type: 'string',
      required: true,
      description: 'The phone number of the delivery partner',
      maxLength: 20
    }
  },


  exits: {
    success: {
      description: 'New delivery partner created.'
    },
  },


  fn: async function (inputs) {
    // Create a new delivery partner
    var newDeliveryPartner = await DeliveryPartner.create({
      name: inputs.name,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber
    }).fetch();

    // Return the new delivery partner
    return newDeliveryPartner;
  }


};
