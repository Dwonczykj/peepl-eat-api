/* eslint-disable no-console */
import moment from 'moment';
import util from 'util';
import {
  DeliveryInformation, DeliveryPartnerObject, getDeliveryPartnerHelpers, IDeliveryPartner
} from "../interfaces/orders/deliveryPartnerHelperObjects";
import { iSlot, TimeWindow } from "../interfaces/vendors/slot";
import { sailsVegi } from '../../api/interfaces/iSails';
import { dateStrFormat, datetimeStrFormatExact } from '../../scripts/utils';

declare var FulfilmentMethod: any;
declare var sails: sailsVegi;
declare var DeliveryPartner: any;

export type GetAvailableDeliveryPartnerFromPoolInputs = {
  fulfilmentSlotFrom: string;
  fulfilmentSlotTo: string;
  pickupFromVendor: number;
  deliveryContactName: string;
  deliveryPhoneNumber: string;
  deliveryComments: string;
  deliveryAddressLineOne: string;
  deliveryAddressLineTwo: string;
  deliveryAddressCity: string;
  deliveryAddressPostCode: string;
};

module.exports = {
  friendlyName: 'Get available deliveryPartner from pool',

  description:
    'Get an available deliveryPartner from the pool of deliveryPartners',

  inputs: {
    // fulfilmentMethodId: {
    //   type: 'number',
    //   required: true,
    //   description: 'The ID of the fulfilmentMethod which is being requested.'
    // },
    fulfilmentSlotFrom: {
      type: 'string',
      required: true,
      description:
        'The date for which time slots need to be generated. Format YYYY-MM-DD',
      // example: '2022-03-24',
      // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    },
    fulfilmentSlotTo: {
      type: 'string',
      required: true,
      description:
        'The date for which time slots need to be generated. Format YYYY-MM-DD',
      // example: '2022-03-24',
      // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    },
    pickupFromVendor: {
      type: 'number',
      required: true,
    },
    deliveryContactName: {
      type: 'string',
      required: true,
    },
    deliveryPhoneNumber: {
      type: 'string',
      required: true,
    },
    deliveryComments: {
      type: 'string',
      defaultsTo: '',
    },
    deliveryAddressLineOne: {
      type: 'string',
      required: true,
    },
    deliveryAddressLineTwo: {
      type: 'string',
      defaultsTo: '',
    },
    deliveryAddressCity: {
      type: 'string',
      required: true,
    },
    deliveryAddressPostCode: {
      type: 'string',
      required: true,
    },
    // deliverBefore: {
    //   type: 'number',
    //   description: 'a unix timestamp for a delivery slot deadline bound to be converted to string by moment.js',
    // },
    // deliverAfter: {
    //   type: 'number',
    //   description: 'a unix timestamp for a delivery slot start bound to be converted to string by moment.js',
    // }
  },

  exits: {
    success: {
      // outputFriendlyName: 'Available slots',
    },
    deliveryPartnerDoesNotHaveDeliveryFulfilmentSetUp: {},
    vendorNotFound: {},
  },

  fn: async function (
    inputs: GetAvailableDeliveryPartnerFromPoolInputs,
    exits
  ) {
    var validSlotsForDeliveryPartner: iSlot[] = [];
    var date = moment
      .utc(inputs.fulfilmentSlotFrom, datetimeStrFormatExact)
      .format(dateStrFormat);

    const vendor = await Vendor.findOne({ id: inputs.pickupFromVendor }).populate('deliveryPartner');

    if (!vendor) {
      return exits.vendorNotFound();
    }
    let deliveryPartners;
    if (vendor.deliveryPartner){
      deliveryPartners = await DeliveryPartner.find({
        // status: 'active',
        id: vendor.deliveryPartner.id
      });
    }else{
      sails.log.info(`No DeliveryPartner set for vendor so take any from the pool`);
      deliveryPartners = await DeliveryPartner.find({
        status: 'active',
        //contains: {deliversToPostCodes: [inputs.deliveryAddressPostCode]},
      });
    }

    const availableDeliveryPartnerInfos = [];
    // check if delivery slot is valid for any delivery partners
    for (let deliveryPartner of deliveryPartners) {
      const deliveryPartnerFulfilmentMethod = await FulfilmentMethod.findOne({
        deliveryPartner: deliveryPartner.id,
        methodType: 'delivery',
      }).populate('openingHours');

      if (!deliveryPartnerFulfilmentMethod) {
        continue;
        // return exits.deliveryPartnerDoesNotHaveDeliveryFulfilmentSetUp();
      }

      try {
        validSlotsForDeliveryPartner =
          await sails.helpers.getAvailableSlots.with({
            date,
            fulfilmentMethodId: deliveryPartnerFulfilmentMethod.id,
          });
      } catch (error) {
        sails.log.error(
          `helpers.getAvailableSlots blew up when in getAvailableDeliveryPartnerFromPool: ${error}`
        );
      }

      if (
        !validSlotsForDeliveryPartner ||
        validSlotsForDeliveryPartner.length < 1
      ) {
        sails.log.info(
          `helpers.getAvailableDeliveryPartnerFromPool found no valid slots from helpers.getAvailableSlots for fm: ${util.inspect(
            deliveryPartnerFulfilmentMethod,
            { depth: null }
          )}`
        );
        // return exits.noValidSlots();
      }

      // Find slot within list of valid slots
      const availableSlot = validSlotsForDeliveryPartner
        .map(
          (slot) =>
            new TimeWindow({ startTime: slot.startTime, endTime: slot.endTime })
        )
        .find((slot) => {
          return slot.overlapsWith(
            new TimeWindow({
              startTime: moment.utc(inputs.fulfilmentSlotFrom),
              endTime: moment.utc(inputs.fulfilmentSlotTo),
            })
          );
        });
      if (availableSlot) {
        availableDeliveryPartnerInfos.push({
          deliveryPartner: deliveryPartner,
          fulfilmentMethod: deliveryPartnerFulfilmentMethod,
          slot: availableSlot,
        });
      }
    }

    if (
      !availableDeliveryPartnerInfos ||
      availableDeliveryPartnerInfos.length < 1
    ) {
      sails.log.warn(
        `No Delivery Partners Slots were available from pool for order to ${
          inputs.deliveryAddressLineOne
        }.\nSlot requested of ${util.inspect(
          {
            startTime: moment.utc(inputs.fulfilmentSlotFrom),
            endTime: moment.utc(inputs.fulfilmentSlotTo),
          },
          { depth: null }
        )} doesnt match available slots for dp: ${util.inspect(
          validSlotsForDeliveryPartner,
          {
            depth: null,
          }
        )}`
      );
      return exits.success(false);
    }

    const availableDeliveryPartners = availableDeliveryPartnerInfos.map(
      (val) => val.deliveryPartner
    );
    const deliveryPartnerHelpers: Array<DeliveryPartnerObject> =
      getDeliveryPartnerHelpers(sails, availableDeliveryPartners);

    if (!deliveryPartnerHelpers || deliveryPartnerHelpers.length < 1) {
      sails.log.warn(
        `No Delivery Partners available from hardcoded pool for order to ${
          inputs.deliveryAddressLineOne
        }.\nAvailable slots were: ${util.inspect(
          availableDeliveryPartnerInfos,
          { depth: null }
        )}`
      );
      return exits.success(false);
    }

    var chosenDeliveryPartner: IDeliveryPartner = null;
    var deliverBefore = moment.utc(
      inputs.fulfilmentSlotFrom,
      'YYYY-MM-DD HH:mm:ss'
    );
    var deliverAfter = moment.utc(
      inputs.fulfilmentSlotTo,
      'YYYY-MM-DD HH:mm:ss'
    );

    for (const deliveryPartner of deliveryPartnerHelpers) {
      const deliveryAvailability =
        await deliveryPartner.requestProvisionalDeliveryAvailability(
          new DeliveryInformation(
            deliverBefore,
            deliverAfter,
            vendor.pickupAddressLineOne,
            vendor.pickupAddressLineTwo,
            vendor.pickupAddressCity,
            vendor.pickupAddressPostCode,
            vendor.name,
            inputs.deliveryContactName,
            inputs.deliveryPhoneNumber,
            inputs.deliveryComments,
            inputs.deliveryAddressLineOne,
            inputs.deliveryAddressLineTwo,
            inputs.deliveryAddressCity,
            inputs.deliveryAddressPostCode
          )
        );
      // sails.log.info(
      //   `${deliveryPartner.deliveryPartnerName} ${deliveryAvailability.status} delivery`
      // );
      if (!deliveryPartner.requestDeliveryAvailability) {
        chosenDeliveryPartner = deliveryPartner;
        return exits.success(chosenDeliveryPartner.deliveryPartner);
      }
      if (deliveryAvailability.status === 'accepted') {
        chosenDeliveryPartner = deliveryPartner;
        return exits.success(chosenDeliveryPartner.deliveryPartner);
      } else if (
        deliveryAvailability.status === 'pending' &&
        chosenDeliveryPartner === null
      ) {
        chosenDeliveryPartner = deliveryPartner;
      }
    }
    return exits.success(chosenDeliveryPartner.deliveryPartner);
  },
};
