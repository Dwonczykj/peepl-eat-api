import { FulfilmentMethodType } from '../../../scripts/utils';

export interface GetFulfilmentMethods {
  vendor: number;
  deliveryPartner?: number;
}

export type getFulfilmentMethodsSuccess = {
  [unusedMethodType in
    FulfilmentMethodType['methodType']]: Array<FulfilmentMethodType>;
};

module.exports = {
  friendlyName: 'Get fulfilment methods',

  description: 'Get fulfilment methods',

  inputs: {
    vendor: {
      type: 'number',
      required: true,
    },
    deliveryPartner: {
      type: 'number',
      allowNull: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      data: null,
    },
  },

  fn: async function (
    inputs: GetFulfilmentMethods,
    exits: {
      success: (
        unused: getFulfilmentMethodsSuccess
      ) => getFulfilmentMethodsSuccess;
    }
  ) {
    var vendor = await Vendor.findOne(inputs.vendor).populate(
      'deliveryFulfilmentMethod&collectionFulfilmentMethod'
    );

    let _deliveryPartner;
    try {
      _deliveryPartner = await DeliveryPartner.findOne(
        inputs.deliveryPartner
      ).populate('deliveryFulfilmentMethod');
    } catch (unusedError) {
      // ignore
    }
    const deliveryPartner = _deliveryPartner;

    const deliveryFMs: Array<FulfilmentMethodType> = [];
    if (vendor.deliveryFulfilmentMethod) {
      // eligibleDeliveryDates = await sails.helpers.getAvailableDates(vendor.deliveryFulfilmentMethod.id);
      deliveryFMs.push(vendor.deliveryFulfilmentMethod);
    }

    if (deliveryPartner && deliveryPartner.deliveryFulfilmentMethod) {
      deliveryFMs.push(deliveryPartner.deliveryFulfilmentMethod);
    }

    return exits.success({
      collection: [vendor.collectionFulfilmentMethod],
      delivery: deliveryFMs,
    });
  },
};
