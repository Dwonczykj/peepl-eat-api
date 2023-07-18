declare var CategoryGroup: any;

module.exports = {
  friendlyName: 'Edit category group',

  files: ['image'],

  description: '',

  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The id of the category group to edit',
    },
    name: {
      type: 'string',
      required: true,
      description: 'The name of the category group',
      maxLength: 50,
    },
    forRestaurantItem: {
      type: 'boolean',
      required: true,
      description:
        'Whether the category applies to product categories for restaurants or grocers',
    },
    image: {
      type: 'ref',
    },
  },

  exits: {
    success: {
      description: 'category group edited.',
    },
    notFound: {
      description: 'There is no category group with that ID!',
      responseType: 'notFound',
    },
    unauthorised: {
      description: 'You are not authorised to edit this vendor.',
      responseType: 'unauthorised',
    },
  },

  fn: async function (inputs, exits) {
    // Find the category group to edit
    var categoryGroup = await CategoryGroup.findOne({
      id: inputs.id,
    });

    if (!categoryGroup) {
      return exits.notFound();
    }

    inputs.imageUrl = '';
    if (inputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        inputs.imageUrl = `https://${sails.config.custom.amazonS3Bucket}.s3.${sails.config.custom.amazonS3BucketRegion}.amazonaws.com/${imageInfo.fd}`;
      }
      delete inputs.image;
    }

    // Update the category group
    await CategoryGroup.updateOne({
      id: inputs.id,
    }).set({
      name: inputs.name,
      forRestaurantItem: inputs.forRestaurantItem,
      imageUrl: inputs.imageUrl,
    });

    // Return the updated category group
    // All done.
    return exits.success({ categoryGroup });
  },
};
