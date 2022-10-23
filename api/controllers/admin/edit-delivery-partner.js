module.exports = {


  friendlyName: 'Edit delivery partner',


  description: '',


  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The id of the delivery partner to edit'
    },
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
      description: 'Delivery partner edited.'
    },
    notFound: {
      description: 'There is no delivery partner with that ID!',
      responseType: 'notFound'
    },
    unauthorised: {
      description: 'You are not authorised to edit this vendor.',
      responseType: 'unauthorised'
    },
  },


  fn: async function (inputs, exits) {
    // Find the delivery partner to edit
    var deliveryPartner = await DeliveryPartner.findOne({
      id: inputs.id
    });

    if (!deliveryPartner) {
      return exits.notFound();
    }

    // Update the delivery partner
    deliveryPartner = await DeliveryPartner.updateOne({
      id: inputs.id,
    }).set({
      name: inputs.name,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber,
      status: inputs.status,
    });

    // Return the updated delivery partner
    // All done.
    return exits.success(deliveryPartner);

  }


};
