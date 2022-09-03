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
    successJSON: {
      statusCode: 200,
    },
    alreadyExists: {
      description: 'delivery partner already exists',
      statuscode: 400,
    }
  },


  fn: async function (inputs, exits) {
    var exist = await DeliveryPartner.find([{
      email: inputs.email,
    }, {
      name: inputs.name,
    }]);

    if (exist) {
      return exits.alreadyExists();
    }

    // Create a new delivery partner
    var newDeliveryPartner = await DeliveryPartner.create({
      name: inputs.name,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber,
      status: inputs.status
    }).fetch();

    // Return the new delivery partner
    // return newDeliveryPartner;
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(
        { newDeliveryPartner }
      );
    } else {
      return exits.success({ newDeliveryPartner });
    }
  }


};
