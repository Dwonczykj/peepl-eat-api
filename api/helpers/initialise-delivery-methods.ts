import { sailsModelKVP, SailsModelType, sailsVegi } from "../../api/interfaces/iSails";
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
      const vendor = await Vendor.findOne(inputs.vendor).populate('pickupAddress');
      let newAddress: sailsModelKVP<AddressType> | AddressType;
      if(vendor.pickupAddress){
        newAddress = await Address.create({
          label: 'Fulfilment Origin',
          addressLineOne: vendor.pickupAddress.addressLineOne,
          addressLineTwo: vendor.pickupAddress.addressLineTwo,
          addressTownCity: vendor.pickupAddress.addressTownCity,
          addressPostCode: vendor.pickupAddress.addressPostCode,
          addressCountryCode: vendor.pickupAddress.addressCountryCode,
          latitude: vendor.pickupAddress.latitude,
          longitude: vendor.pickupAddress.longitude,
          vendor: inputs.vendor,
        }).fetch();
      }else{
        newAddress = await Address.create({
          label: 'Fulfilment Origin',
          addressLineOne: '',
          addressLineTwo: '',
          addressTownCity: '',
          addressPostCode: '',
          addressCountryCode: 'UK',
          latitude: 0.0,
          longitude: 0.0,
          vendor: inputs.vendor,
        }).fetch();
      }
      
      delv = await FulfilmentMethod.create({
        vendor: inputs.vendor,
        methodType: 'delivery',
        fulfilmentOrigin: vendor.pickupAddress && vendor.pickupAddress.id,
      }).fetch();

      col = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'collection'}).fetch();

      await Vendor.updateOne(inputs.vendor).set({
        deliveryFulfilmentMethod: delv.id,
        collectionFulfilmentMethod: col.id
      });
    } else if (inputs.deliveryPartner){
      // const newEmptyAddress = await Address.create({
      //   label: 'Fulfilment Origin',
      //   addressLineOne: '',
      //   addressLineTwo: '',
      //   addressTownCity: '',
      //   addressPostCode: '',
      //   addressCountryCode: 'UK',
      //   latitude: 0.0,
      //   longitude: 0.0,
      //   deliveryPartner: inputs.deliveryPartner,
      // }).fetch();
      // const deliveryPartner = await DeliveryPartner.findOne(inputs.deliveryPartner).populate('deliveryOriginAddress');
      delv = await FulfilmentMethod.create({
        deliveryPartner: inputs.deliveryPartner,
        methodType: 'delivery',
        // fulfilmentOrigin: newEmptyAddress.id,
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

