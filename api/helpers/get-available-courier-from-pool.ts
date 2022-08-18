declare var OpeningHours: any;
declare var FulfilmentMethod: any;
var moment = require('moment');
import { couriers, DeliveryInformation, ICourier } from './couriers';

module.exports = {


  friendlyName: 'Get available courier from pool',


  description: 'Get an available courier from the pool of couriers',


  inputs: {
    // fulfilmentMethodId: {
    //   type: 'number',
    //   required: true,
    //   description: 'The ID of the fulfilmentMethod which is being requested.'
    // },
    // fulfilmentSlotFrom: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    // fulfilmentSlotTo: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    pickupFromVendor: {
      model: 'vendor',
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
      required: true,
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
    deliverBefore: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot deadline bound to be converted to string by moment.js',
    },
    deliverAfter: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot start bound to be converted to string by moment.js',
    }
  },


  exits: {
    success: {
      // outputFriendlyName: 'Available slots',
    },
  },


  fn: async function (inputs, exits) {
    // TODO: Consider timezones
    // TODO: Account for overnight opening hours
    // TODO: Generate IDs for slots to simplify logic (but must account for changes to opening hours and slot duration)
    // TODO: Limit to 7 days in future

    var deliverBefore = moment.unix(inputs.deliverBefore).calendar();
    var deliverAfter = moment.unix(inputs.deliverAfter).calendar();

    var requestBody = {
      pickup: {
        address: {
          streetAddress: `${inputs.pickupAddressLineOne}, ${inputs.pickupAddressLineTwo}, ${inputs.pickupAddressCity}, ${inputs.pickupAddressPostCode}`,
        },
      },
      dropoff: {
        address: {
          contactName: inputs.deliveryContactName,
          telephone: inputs.deliveryPhoneNumber,
          comments: inputs.deliveryComments,
          streetAddress: `${inputs.deliveryAddressLineOne}, ${inputs.deliveryAddressLineTwo}, ${inputs.deliveryAddressCity}, ${inputs.deliveryAddressPostCode}`
        },
        before: deliverBefore,
        after: deliverAfter
      }
    };

    const n = couriers.length;
    var chosenCourier:ICourier = null;
    for(var i = 0; i < n; i += 1) {
      const courier: ICourier = couriers[i];
      const deliveryAvailability = await courier.requestProvisionalDeliveryAvailability(new DeliveryInformation(
        deliverBefore,
        deliverAfter,
        inputs.pickupFromVendor.pickupAddressLineOne,
        inputs.pickupFromVendor.pickupAddressLineTwo,
        inputs.pickupFromVendor.pickupAddressCity,
        inputs.pickupFromVendor.pickupAddressPostCode,
        inputs.pickupFromVendor.name,
        inputs.deliveryContactName,
        inputs.deliveryPhoneNumber,
        inputs.deliveryComments,
        inputs.deliveryAddressLineOne,
        inputs.deliveryAddressLineTwo,
        inputs.deliveryAddressCity,
        inputs.deliveryAddressPostCode,
        inputs.vegiOrderId
      ));
      if(deliveryAvailability.status === 'accepted'){
        chosenCourier = courier;
        break;
      } else if(deliveryAvailability.status === 'pending' && chosenCourier === null) {
        chosenCourier = courier;
      }
    }
    return chosenCourier;
  }
};
