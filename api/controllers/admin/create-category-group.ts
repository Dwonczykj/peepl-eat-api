var CategoryGroup: any;
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
    forRestaurantItem: {
      type: 'boolean',
      required: true,
      description: 'Whether the category applies to product categories for restaurants or grocers',
    },
    image: {
      type: 'ref',
    },
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
      statusCode: 400,
    }
  },


  fn: async function (inputs, exits) {
    var exist = await CategoryGroup.find([{
      name: inputs.name,
    }]);

    if (exist) {
      return exits.alreadyExists();
    }

    if (inputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
    }

    // delete inputs.image;

    // Create a new delivery partner
    var newCategoryGroup = await CategoryGroup.create({
      name: inputs.name,
      forRestaurantItem: inputs.forRestaurantItem,
      imageUrl: inputs.imageUrl
    }).fetch();

    // Return the new delivery partner
    // return newCategoryGroup;
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(
                { newCategoryGroup }
      );
    } else {
      return exits.success({ newCategoryGroup });
    }
  }


};
