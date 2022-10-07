module.exports = {


  friendlyName: 'Validate order',


  description: 'Validate order.',


  inputs: {
    items: {
      type: 'ref',
      description: 'Cart items from the frontend, which include the product id and corresponding options.',
      required: true
    },
    address: {
      type: 'ref',
      description: 'The user\'s address.',
      required: true
    },
    total: {
      type: 'number',
      description: 'The total order value, including shipping.',
      required: true
    },
    marketingOptIn: {
      type: 'boolean'
    },
    discountCode: {
      type: 'string',
      required: false
    },
    vendor: {
      type: 'number',
      required: true
    },
    fulfilmentMethod: {
      type: 'number',
      required: true
    },
    fulfilmentSlotFrom: {
      type: 'string',
      required: true
    },
    fulfilmentSlotTo: {
      type: 'string',
      required: true
    },
    tipAmount: {
      type: 'number',
      defaultsTo: 0
    },
    walletAddress: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },
    noItemsFound: {
      description: 'No items in order'
    },
    invalidVendor: {
      description: 'The vendor is invalid.',
    },
    invalidFulfilmentMethod: {
      description: 'The fulfilment method is invalid.',
    },
    invalidProduct: {
      description: 'The product option is invalid.',
    },
    invalidProductOption: {
      description: 'The product option is invalid.',
    },
    invalidPostalDistrict: {
      description: 'The postal district is invalid.',
    },
    invalidSlot: {
      description: 'The fulfilment slot is invalid.',
    },
    invalidDiscountCode: {
      description: 'The discount code is invalid.',
    },
    invalidUserAddress: {
      description: 'The address of the user given in the order is invalid.',
      data: null,
    }
  },


  fn: async function (inputs, exits) {
    if (!inputs.items) {
      return exits.noItemsFound();
    }

    // Check that the vendor exists
    let vendor = await Vendor.findOne({ id: inputs.vendor })
      .populate('fulfilmentPostalDistricts');

    if (!vendor) {
      return exits.invalidVendor();
    }

    // Check that fulfilment method belongs to vendor or delivery partner
    let fulfilmentMethod = await FulfilmentMethod.findOne({
      id: inputs.fulfilmentMethod
    });

    if (!fulfilmentMethod) {
      return exits.invalidFulfilmentMethod();
    }
    if (fulfilmentMethod.vendor !== vendor.id && fulfilmentMethod.deliveryPartner !== vendor.deliveryPartner) {
      return exits.invalidFulfilmentMethod();
    }

    // Get all the products from the database - only those associated with the vendor
    let products = await Product.find({
      id: inputs.items.map(item => item.id),
      vendor: vendor.id
    })
      .populate('options&options.values');

    // Iterate through the items in the order
    for (let item of inputs.items) {
      // Check that the product exists
      let product = products.find(product => product.id === item.id);
      if (!product) {
        return exits.invalidProduct();
      }

      // Check that the item has all required options
      for (let productOption of product.options) {
        if (productOption.isRequired && !Object.keys(item.options).find(option => parseInt(option) === productOption.id)) {
          return exits.invalidProductOption();
        }
      }

      // Check that the product has the correct option values
      for (var i = 0; i < Object.keys(item.options).length; i++) {
        let option = product.options.find(option => option.id === parseInt(Object.keys(item.options)[i])); // Option is the actual option from DB

        // If option is not found
        if (!option) {
          return exits.invalidProductOption();
        }

        // If option value for item is not found in product option values
        if (!option.values.some(value => value.id === item.options[Object.keys(item.options)[i]])) {
          return exits.invalidProductOption();
        }
      }
    }

    if(fulfilmentMethod.methodType === 'delivery') {
      // Check if vendor delivers to postal district
      const postcodeRegex = /^(((([A-Z][A-Z]{0,1})[0-9][A-Z0-9]{0,1}) {0,}[0-9])[A-Z]{2})$/;

      const m = postcodeRegex.exec(inputs.address.postCode);
      if (m !== null) {
        let postalDistrict = m[3]; // 3rd match group is the postal district
        let postalDistrictStringArray = vendor.fulfilmentPostalDistricts.map(postalDistrict => postalDistrict.outcode);

        if (!postalDistrictStringArray.includes(postalDistrict)) {
          // throw new Error('Vendor does not deliver to this postal district.');
          return exits.invalidPostalDistrict();
        }
      } else {
        // Postcode is invalid
        return exits.invalidPostalDistrict();
      }
    }
    if (fulfilmentMethod.methodType === 'collection') {
      // require user to submit their name and address for identification purposes on collection
      if(!inputs.address){
        return exits.invalidUserAddress({data: 'address object required'});
      }
      if(!inputs.address.name){
        return exits.invalidUserAddress({data: 'address.name required'});
      }
      if(!inputs.address.email){
        return exits.invalidUserAddress({data: 'address.email required'});
      }
      if(!inputs.address.phoneNumber){
        return exits.invalidUserAddress({data: 'address.phoneNumber required'});
      }
    }


    // Check if the delivery slots are valid
    var slotsValid = await sails.helpers.validateDeliverySlot
      .with({
        fulfilmentMethodId: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo
      });

    if (!slotsValid) {
      return exits.invalidSlot('Invalid delivery slot');
    }

    // Check discount code is valid
    if (inputs.discountCode) {
      var discount = await sails.helpers.checkDiscountCode(inputs.discountCode, inputs.vendor);

      if (!discount) {
        return exits.invalidDiscountCode('Invalid discount code');
      }
    }

    return exits.success();
  }
};

