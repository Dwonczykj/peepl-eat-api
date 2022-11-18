import { SailsModelType, sailsVegi } from "../../api/interfaces/iSails";
import { AddressType, DeliveryPartnerType, FulfilmentMethodType, OpeningHoursType, VendorType } from "../../scripts/utils";

declare var sails: sailsVegi;
declare var Vendor: SailsModelType<VendorType>;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;
declare var Address: SailsModelType<AddressType>;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;
declare var OpeningHours: SailsModelType<OpeningHoursType>;

export type InitialiseDeliveryMethodsInput = {
  vendor?: number | null,
  deliveryPartner?: number | null,
};

export type InitialiseDeliveryMethodsResult = void;

module.exports = {


  friendlyName: 'Initialise delivery methods',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
    },
    deliveryPartner: {
      type: 'number',
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs: InitialiseDeliveryMethodsInput, exits: {
    success: () => InitialiseDeliveryMethodsResult;
  }) {
    // TODO: Do all this inside a transaction

    // Create FulfilmentMethods
    let delv;
    let col;

    // Add FulfilmentMethods to Vendor/DeliveryPartner
    if(inputs.vendor){
      const vendor = await Vendor.findOne(inputs.vendor);
      const geoLocation = await sails.helpers.getCoordinatesForAddress.with({
        addressLineOne: vendor.pickupAddressLineOne,
        addressLineTwo: vendor.pickupAddressLineTwo,
        addressTownCity: vendor.pickupAddressCity,
        addressPostCode: vendor.pickupAddressPostCode,
        addressCountryCode: 'UK',
      });
      const vendorDeliveryAddressOrigin = await Address.create({
        label: 'home',
        addressLineOne: vendor.pickupAddressLineOne,
        addressLineTwo: vendor.pickupAddressLineTwo,
        addressTownCity: vendor.pickupAddressCity,
        addressPostCode: vendor.pickupAddressPostCode,
        addressCountryCode: 'UK',
        latitude: geoLocation.lat,
        longitude: geoLocation.lng,
        vendor: inputs.vendor,
      }).fetch();
      delv = await FulfilmentMethod.create({
        vendor: inputs.vendor,
        methodType: 'delivery',
        fulfilmentOrigin: vendorDeliveryAddressOrigin.id,
      }).fetch();

      col = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'collection'}).fetch();

      await Vendor.updateOne(inputs.vendor).set({
        deliveryFulfilmentMethod: delv.id,
        collectionFulfilmentMethod: col.id
      });
    } else if (inputs.deliveryPartner){
      const deliveryPartner = await DeliveryPartner.findOne(inputs.deliveryPartner).populate('deliveryOriginAddress');
      delv = await FulfilmentMethod.create({
        deliveryPartner: inputs.deliveryPartner,
        methodType: 'delivery',
        fulfilmentOrigin: deliveryPartner.deliveryOriginAddress && deliveryPartner.deliveryOriginAddress.id,
      }).fetch();

      await DeliveryPartner.updateOne(inputs.deliveryPartner).set({
        deliveryFulfilmentMethod: delv.id,
      });
    }

    // Generate collection/delivery blank opening hours
    var openingHoursDel = [];
    var openingHoursCol= [];
    var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Create blank opening hours for each day
    weekdays.forEach((weekday) => {
      // Delivery hours
      openingHoursDel.push({
        dayOfWeek: weekday,
        isOpen: false,
        openTime: '09:00',
        closeTime: '17:00',
        fulfilmentMethod: delv.id
      });

      if(inputs.vendor){
        // Collection hours
        openingHoursCol.push({
          dayOfWeek: weekday,
          isOpen: false,
          openTime: '09:00',
          closeTime: '17:00',
          fulfilmentMethod: col.id
        });
      }
    });

    // Add the opening hours to the database
    const newHoursDel = await OpeningHours.createEach(openingHoursDel).fetch();
    const newHoursIDsDel = newHoursDel.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(delv.id, 'openingHours').members(newHoursIDsDel);

    if(inputs.vendor){
      const newHoursCol = await OpeningHours.createEach(openingHoursCol).fetch();
      const newHoursIDsCol = newHoursCol.map(({ id }) => id);
      await FulfilmentMethod.addToCollection(col.id, 'openingHours').members(newHoursIDsCol);
    }

    return exits.success();
  }


};

