import { AvailableDateOpeningHours } from '../../../api/helpers/get-available-dates';
import { DeliveryPartnerType, FulfilmentMethodType, VendorType } from '../../../scripts/utils';
import { sailsModelKVP, SailsModelType, sailsVegi } from '../../interfaces/iSails';
declare var sails: sailsVegi;

declare var Vendor: SailsModelType<VendorType>;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;

export type GetEligibleOrderUpdates = {
  vendor: number;
  deliveryPartner?: number;
}

export type getEligibleOrderDatesSuccess = {
  [unusedMethodType in FulfilmentMethodType['methodType']]: AvailableDateOpeningHours;
};


module.exports = {
  friendlyName: 'Get eligible order dates',

  description: 'Get eligible order dates',

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

  // inputs: sails.helpers.generateSchema('orders/iGetEligibleOrderUpdates', 'GetEligibleOrderUpdates'),

  exits: {
    success: {
      statusCode: 200,
    },
    badRequest: {
      statusCode: 400,
      description:
        'BadRequest as deliveryPartner input doesnt match the deliveryPartner assigned to the vendor.',
    },
    vendorNotFound: {
      statusCode: 404,
    },
    deliveryPartnerNotFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: GetEligibleOrderUpdates,
    exits: {
      success: (
        unused: getEligibleOrderDatesSuccess
      ) => getEligibleOrderDatesSuccess;
      badRequest: (unusedMessage: string) => void;
      vendorNotFound: (unusedMessage: string) => void;
      deliveryPartnerNotFound: (unusedMessage: string) => void;
    }
  ) {
    var eligibleCollectionDates: AvailableDateOpeningHours = {};
    var eligibleDeliveryDates: AvailableDateOpeningHours = {};

    var vendor = await Vendor.findOne(inputs.vendor).populate(
      'deliveryFulfilmentMethod&collectionFulfilmentMethod&deliveryPartner'
    );
    if (!vendor) {
      return exits.vendorNotFound(`Vendor [${inputs.vendor}] not found`);
    }
    if(vendor.deliveryPartner && inputs.deliveryPartner && inputs.deliveryPartner !== vendor.deliveryPartner.id){
      return exits.badRequest(`Inputs DeliveryPartner ${inputs.deliveryPartner} !== vendor's deliveryPartner: ${vendor.deliveryPartner.id}`);
    }

    let _deliveryPartner: DeliveryPartnerType;
    let _deliveryPartnerId = inputs.deliveryPartner;
    if(vendor.deliveryPartner){
      _deliveryPartnerId = vendor.deliveryPartner.id;
    }
    if (_deliveryPartnerId) {
      try {
        _deliveryPartner = await DeliveryPartner.findOne(
          _deliveryPartnerId
        ).populate('deliveryFulfilmentMethod');
      } catch (unusedError) {
        // ignore
      }
      if (!_deliveryPartner) {
        return exits.deliveryPartnerNotFound(
          `DeliveryPartner [${inputs.deliveryPartner}] not found`
        );
      }
    }
    const deliveryPartner = _deliveryPartner;

    const deliveryFMIds: Array<number> = [];
    if (vendor.deliveryFulfilmentMethod) {
      // eligibleDeliveryDates = await sails.helpers.getAvailableDates(vendor.deliveryFulfilmentMethod.id);
      deliveryFMIds.push(vendor.deliveryFulfilmentMethod.id);
    }

    if (deliveryPartner && deliveryPartner.deliveryFulfilmentMethod) {
      deliveryFMIds.push(deliveryPartner.deliveryFulfilmentMethod.id);
    }

    if (deliveryFMIds.length > 0) {
      eligibleDeliveryDates = await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: deliveryFMIds,
      });
    }

    if (vendor.collectionFulfilmentMethod) {
      eligibleCollectionDates = await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: [vendor.collectionFulfilmentMethod.id],
      });
    }

    return exits.success({
      collection: eligibleCollectionDates,
      delivery: eligibleDeliveryDates,
    });
  },
};
