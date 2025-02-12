import util from 'util';
import {
  CreateOrderInputs,
  ValidateOrderResult,
} from '../../api/controllers/orders/create-order';
import { SailsModelType, sailsVegi } from '../../api/interfaces/iSails';
import { FulfilmentMethodType, ProductType, VendorType } from '../../scripts/utils';
import { GetCoordinatesForAddressResult } from './get-coordinates-for-address';
import { Currency } from '../../api/interfaces/peeplPay';
declare var sails: sailsVegi;
declare var Product: SailsModelType<ProductType>;
declare var Vendor: SailsModelType<VendorType>;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;

module.exports = {
  friendlyName: 'Validate order',

  description: 'Validate order.',

  inputs: {
    items: {
      type: 'ref',
      description:
        'Cart items from the frontend, which include the product id and corresponding options.',
      required: true,
    },
    address: {
      type: 'ref',
      description: "The user's address.",
      required: true,
    },
    firebaseRegistrationToken: {
      type: 'string',
      description: 'token used for firebase notifications',
      required: false,
    },
    total: {
      type: 'number',
      description: 'The total order value, including shipping.',
      required: true,
    },
    currency: {
      type: 'string',
      description: 'The currency for the total amount',
      required: true,
      isIn: [
        Currency.EUR,
        Currency.GBP,
        Currency.GBPx,
        Currency.GBT,
        Currency.PPL,
        Currency.USD,
      ],
    },
    marketingOptIn: {
      type: 'boolean',
    },
    discountCodes: {
      type: 'ref',
      required: false,
    },
    vendor: {
      type: 'number',
      required: true,
    },
    fulfilmentMethod: {
      type: 'number',
      required: true,
    },
    fulfilmentSlotFrom: {
      type: 'string',
      required: true,
    },
    fulfilmentSlotTo: {
      type: 'string',
      required: true,
    },
    tipAmount: {
      type: 'number',
      defaultsTo: 0,
    },
    walletAddress: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
    noItemsFound: {
      description: 'No items in order',
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
    },
  },

  fn: async function (
    inputs: CreateOrderInputs,
    exits: {
      success: (unusedArg: ValidateOrderResult) => ValidateOrderResult;
      noItemsFound: (unused?: { data: any } | Error | string | null) => void;
      invalidVendor: (unused?: { data: any } | Error | string | null) => void;
      invalidFulfilmentMethod: (
        unused?: { data: any } | Error | string | null
      ) => void;
      invalidProduct: (unused?: { data: any } | Error | string | null) => void;
      invalidProductOption: (
        unused?: { data: any } | Error | string | null
      ) => void;
      invalidPostalDistrict: (
        unused?: { data: any } | Error | string | null
      ) => void;
      invalidSlot: (unusedMsg: string) => void;
      invalidDiscountCode: (unusedMsg: string) => void;
      invalidUserAddress: (unusedArg: { data: string }) => void;
    }
  ) {
    if (!inputs.items) {
      sails.log.warn('helpers.validateOrder: noItemsFound');
      return exits.noItemsFound();
    }

    // Check that the vendor exists
    let vendor = await Vendor.findOne({ id: inputs.vendor }).populate(
      'fulfilmentPostalDistricts&deliveryPartner'
    );

    if (!vendor) {
      sails.log.warn('helpers.validateOrder: invalidVendor');
      return exits.invalidVendor();
    }

    // Check that fulfilment method belongs to vendor or delivery partner
    let fulfilmentMethod = await FulfilmentMethod.findOne({
      id: inputs.fulfilmentMethod,
    }).populate('fulfilmentOrigin&vendor&deliveryPartner');

    if (!fulfilmentMethod) {
      sails.log.warn('helpers.validateOrder: invalidFulfilmentMethod');
      return exits.invalidFulfilmentMethod();
    } else if (
      (fulfilmentMethod.vendor && fulfilmentMethod.vendor.id !== vendor.id) ||
      (fulfilmentMethod.deliveryPartner &&
        fulfilmentMethod.deliveryPartner.id !== vendor.deliveryPartner.id)
    ) {
      sails.log.warn('helpers.validateOrder: invalidFulfilmentMethod');
      return exits.invalidFulfilmentMethod();
    }

    // Get all the products from the database - only those associated with the vendor
    let products = await Product.find({
      id: inputs.items.map((item) => item.id),
      vendor: vendor.id,
    }).populate('options&options.values');

    // const util = require("util");
    // sails.log.info(`orderValidation helper: located (${products.length}) products with ids: ${util.inspect(products.map(p => p.id), {depth: null})}`);

    // Iterate through the items in the order
    for (let item of inputs.items) {
      let product = products.find((product) => product.id === item.id);
      if (!product) {
        sails.log.warn(
          `helpers.validateOrder: invalidProduct [id: ${item.id}. ${item}]. Check products given are registered to the correct vendor.`
        );
        return exits.invalidProduct(
          `No product was found in DB matching item with id: ${item.id}. ${item}`
        );
      }

      // Check that the item has all required options
      for (let productOption of product.options) {
        if (
          productOption.isRequired &&
          !Object.keys(item.options).find(
            (option) => parseInt(option) === productOption.id
          )
        ) {
          sails.log.warn('helpers.validateOrder: invalidProductOption');
          return exits.invalidProductOption();
        }
      }

      // Check that the product has the correct option values
      for (var i = 0; i < Object.keys(item.options).length; i++) {
        let option = product.options.find(
          (option) => option.id === parseInt(Object.keys(item.options)[i])
        ); // Option is the actual option from DB

        // If option is not found
        if (!option) {
          sails.log.warn('helpers.validateOrder: invalidProductOption');
          return exits.invalidProductOption({
            data: 'product option not found',
          });
        }

        // If option value for item is not found in product option values
        if (
          !option.values.some(
            (value) => value.id === item.options[Object.keys(item.options)[i]]
          )
        ) {
          sails.log.warn('helpers.validateOrder: invalidProductOption');
          return exits.invalidProductOption({
            data: 'product option not found',
          });
        }
      }
    }
    if (fulfilmentMethod.methodType === 'delivery') {
      if (
        fulfilmentMethod.maxDeliveryDistance > 0 &&
        fulfilmentMethod.fulfilmentOrigin
      ) {
        let deliveryCoordinates: GetCoordinatesForAddressResult | null;
        try {
          const _deliveryCoordinates =
            await sails.helpers.getCoordinatesForAddress.with({
              addressLineOne: inputs.address.lineOne,
              addressLineTwo: inputs.address.lineTwo,
              addressTownCity: inputs.address.city,
              addressPostCode: inputs.address.postCode,
              addressCountryCode: 'UK',
            });
          deliveryCoordinates = _deliveryCoordinates;
          inputs.address.lat = _deliveryCoordinates.lat;
          inputs.address.lng = _deliveryCoordinates.lng;
        } catch (err) {
          sails.log.error(
            `Unable to get coordinates of address with postcode: ${inputs.address.postCode} from api: ${err}`
          );
          deliveryCoordinates = null;
        }
        const canFulfilDelivery =
          await sails.helpers.fulfilmentMethodDeliversToAddress.with({
            fulfilmentMethod: fulfilmentMethod.id,
            latitude: deliveryCoordinates.lat,
            longitude: deliveryCoordinates.lng,
          });
        if (!canFulfilDelivery.canDeliver) {
          sails.log.warn(
            `helpers.validateOrder: invalidPostalDistrict as (${deliveryCoordinates.lat},${deliveryCoordinates.lng}]) out of delivery radius with readon: "${canFulfilDelivery.reason}"`
          );
          return exits.invalidPostalDistrict();
        }
      } else {
        // Check if vendor delivers to postal district
        const postcodeRegex =
          /^(((([A-Z][A-Z]{0,1})[0-9][A-Z0-9]{0,1}) {0,}[0-9])[A-Z]{2})$/;

        const m = postcodeRegex.exec(inputs.address.postCode);
        if (m !== null) {
          let postalDistrict = m[3]; // 3rd match group is the postal district
          let postalDistrictStringArray = vendor.fulfilmentPostalDistricts.map(
            (postalDistrict) => postalDistrict.outcode
          );

          if (!postalDistrictStringArray.includes(postalDistrict)) {
            // throw new Error('Vendor does not deliver to this postal district.');
            sails.log.warn('helpers.validateOrder: invalidPostalDistrict');
            return exits.invalidPostalDistrict();
          }
        } else {
          // Postcode is invalid
          sails.log.warn('helpers.validateOrder: invalidPostalDistrict');
          return exits.invalidPostalDistrict();
        }
      }
    }
    if (fulfilmentMethod.methodType === 'collection') {
      // require user to submit their name and address for identification purposes on collection
      if (!inputs.address) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress address obj');
        return exits.invalidUserAddress({ data: 'address object required' });
      }
      if (!inputs.address.name) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress name');
        return exits.invalidUserAddress({ data: 'address.name required' });
      }
      if (!inputs.address.email) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress email');
        return exits.invalidUserAddress({ data: 'address.email required' });
      }
      if (!inputs.address.phoneNumber) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress phoneNumber');
        return exits.invalidUserAddress({
          data: 'address.phoneNumber required',
        });
      }
      if (!inputs.address.city) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress city');
        return exits.invalidUserAddress({ data: 'address.city' });
      }
      if (!inputs.address.lineOne) {
        sails.log.warn('helpers.validateOrder: invalidUserAddress lineOne');
        return exits.invalidUserAddress({ data: 'address.lineOne' });
      }
      // if (!inputs.address.postCode) {
      //   sails.log.warn('helpers.validateOrder: invalidUserAddress postCode');
      //   return exits.invalidUserAddress({ data: 'address.postCode' });
      // }
    }

    // Check if the delivery slots are valid for vendor
    var slotsValid;
    try {
      slotsValid = await sails.helpers.validateDeliverySlot.with({
        fulfilmentMethodId: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
      });
    } catch (error) {
      sails.log.error(
        `validateDeliverySlot helper in validateOrder: failed to return: ${error}`
      );
      return exits.invalidSlot('Invalid delivery slot');
    }

    if (!slotsValid) {
      sails.log.warn('helpers.validateOrder: invalidSlot');
      return exits.invalidSlot('Invalid delivery slot');
    }

    // Check discount code is valid
    if (inputs.discountCodes && inputs.discountCodes.length) {
      const discountsAreFine = await Promise.all(inputs.discountCodes.filter(dc => dc).map((discountCode) =>
        sails.helpers.checkDiscountCode.with({discountCode:discountCode, vendorId: inputs.vendor})
      ));
      const badDiscounts = discountsAreFine.filter(isFine => !isFine);
      if (badDiscounts.length > 0) {
        sails.log.warn('helpers.validateOrder: invalidDiscountCode');
        return exits.invalidDiscountCode('Invalid discount code');
      }
    }

    return exits.success({
      orderInputs: inputs,
      orderIsValid: true,
    });
  },
};

