declare var CategoryGroup: any;
import util from 'util';
module.exports = {
  friendlyName: "Create category group",

  description: "",

  inputs: {
    name: {
      type: "string",
      required: true,
      description: "The name of the group of product categories",
      maxLength: 50,
    },
    forRestaurantItem: {
      type: "boolean",
      required: true,
      description:
        "Whether the category applies to product categories for restaurants or grocers",
    },
    image: {
      type: "ref",
    },
  },

  exits: {
    success: {
      description: "New category group created.",
      statusCode: 200,
    },
    successJSON: {
      statusCode: 200,
    },
    alreadyExists: {
      description: "category group already exists",
      statusCode: 400,
    },
  },

  fn: async function (inputs, exits) {
    var exist = await CategoryGroup.find({
      name: inputs.name,
    });
    if (exist && exist.length > 0) {
      sails.log(
        `CategoryGroup: ${util.inspect(exist[0], {
          depth: null,
        })} already exists.`
      );
      return exits.alreadyExists();
    }
    
    inputs.imageUrl = '';
    if (inputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
    }

    // delete inputs.image;

    // Create a new category group
    var newCategoryGroup = await CategoryGroup.create({
      name: inputs.name,
      forRestaurantItem: inputs.forRestaurantItem,
      imageUrl: inputs.imageUrl,
    }).fetch();

    // Return the new category group
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ newCategoryGroup });
    } else {
      return exits.success({ newCategoryGroup });
    }
  },
};
