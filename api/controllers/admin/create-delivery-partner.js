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
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive'
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
      phoneNumber: inputs.phoneNumber,
      status: inputs.status
    }).fetch();

    // Return the new delivery partner
    return newDeliveryPartner;
  }


};
