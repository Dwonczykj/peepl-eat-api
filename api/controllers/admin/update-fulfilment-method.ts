import { sailsModelKVP, SailsModelType } from '../../../api/interfaces/iSails';
import { AddressType, FulfilmentMethodType, OpeningHoursType, TimeHourString, VendorType } from "../../../scripts/utils";

declare var Address: SailsModelType<AddressType>;
declare var Vendor: SailsModelType<VendorType>;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;

export type UpdateFulfilmentMethodInputs = {
  openingHours: Array<sailsModelKVP<OpeningHoursType>>;
  id: number;
  priceModifier: number;
  slotLength: number;
  bufferLength: number;
  orderCutoff: TimeHourString;
  maxOrders: number;
  maxDeliveryDistance: number;
  fulfilmentOrigin: AddressType;
  vendor?: number | null;
  deliveryPartner?: number | null;
};

export type UpdateFulfilmentMethodResult = {

}

module.exports = {
  friendlyName: 'Update Fulfilment Method',

  inputs: {
    openingHours: {
      type: 'json',
      description: 'The opening hours to be added to the vendor',
      required: true,
    },
    id: {
      type: 'number',
      description: 'The id of the fulfilment method',
    },
    priceModifier: {
      type: 'number',
      description:
        'A positive or negative integer representing the amount of pence to adjust the base price by.',
    },
    slotLength: {
      type: 'number',
      description: 'Slot length in minutes',
      min: 30,
      max: 1440,
    },
    bufferLength: {
      type: 'number',
      min: 0,
      description: 'The required buffer time before booking a slot.',
    },
    orderCutoff: {
      type: 'ref',
      description: 'The time after which no new bookings can be made.',
    },
    maxOrders: {
      type: 'number',
      description: 'The maximum number of orders allowed per slot.',
    },
    maxDeliveryDistance: {
      type: 'number',
      defaultsTo: 0.0,
      allowNull: true,
      description:
        'The max delivery distance allowed by a fulfilment method by road in KM.',
    },
    fulfilmentOrigin: {
      type: 'ref',
      description:
        'The fulfilment origin address to calculate max distance from.',
    },
    deliveryPartner: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    vendor: {
      type: 'number',
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      outputDescription: 'The updated opening hours',
      outputExample: {},
    },
    badInput: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: UpdateFulfilmentMethodInputs,
    exits: {
      success: (
        unusedArg: UpdateFulfilmentMethodResult
      ) => UpdateFulfilmentMethodResult;
      badInput: (unusedArg: string) => void;
    }
  ) {
    // Todo: Authorise this request

    let coordinates = {
      lat: 0, //inputs.fulfilmentOriginLatitude,
      lng: 0, //inputs.fulfilmentOriginLongitude,
    };

    const _fm = await FulfilmentMethod.findOne(inputs.id);

    if (
      inputs.fulfilmentOrigin &&
      inputs.fulfilmentOrigin.addressLineOne &&
      inputs.fulfilmentOrigin.addressPostCode
    ) {
      try {
        const _coordinates = await sails.helpers.getCoordinatesForAddress.with({
          addressLineOne: inputs.fulfilmentOrigin.addressLineOne,
          addressLineTwo: inputs.fulfilmentOrigin.addressLineTwo,
          addressTownCity: inputs.fulfilmentOrigin.addressTownCity,
          addressPostCode: inputs.fulfilmentOrigin.addressPostCode,
          addressCountryCode: 'UK',
        });
        if (_coordinates) {
          coordinates = _coordinates;
        }
      } catch (error) {
        sails.log.error(`${error}`);
      }
    } else if(inputs.vendor){
      
      const populateMethod = `${_fm.methodType}FulfilmentMethod&${_fm.methodType}FulfilmentMethod.fulfilmentOrigin`;
      const vendor = await Vendor.findOne(inputs.vendor).populate(
        // populateMethod
        'pickupAddress'
      );
      // const vFm: FulfilmentMethodType = vendor[populateMethod];
      // assign vendors Pickup address to fulfilmentOrigin as was empty
      inputs.fulfilmentOrigin = vendor.pickupAddress;
      coordinates = {
        lat: vendor.pickupAddress.latitude,
        lng: vendor.pickupAddress.longitude,
      };
    } else {
      return exits.badInput(`Request failed to include a valid address. Check lineOne and postcode`);
    }

    
    let existingAddress: sailsModelKVP<AddressType>;
    if(_fm){
      existingAddress = await Address.findOne(
        _fm.vendor
          ? {
            vendor: _fm.vendor,
            label: 'Fulfilment Origin',
          }
          : {
            deliveryPartner: _fm && _fm.deliveryPartner,
            label: 'Fulfilment Origin',
          }
      );
    }
    let newAddress: AddressType | sailsModelKVP<AddressType>;
    if (!existingAddress) {
      newAddress = await Address.create({
        ...{
          label: 'Fulfilment Origin',
          addressLineOne: inputs.fulfilmentOrigin.addressLineOne,
          addressLineTwo: inputs.fulfilmentOrigin.addressLineTwo,
          addressTownCity: inputs.fulfilmentOrigin.addressTownCity,
          addressPostCode: inputs.fulfilmentOrigin.addressPostCode,
          addressCountryCode: 'UK',
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
        ...(_fm && _fm.vendor
          ? {
            vendor: _fm.vendor,
          }
          : _fm && _fm.deliveryPartner
          ? {
            deliveryPartner: _fm.deliveryPartner,
          } : {}),
      }).fetch();
    } else {
      await Address.update(existingAddress.id).set({
        vendor: inputs.id,
        label: 'Fulfilment Origin',
        addressLineOne: inputs.fulfilmentOrigin.addressLineOne,
        addressLineTwo: inputs.fulfilmentOrigin.addressLineTwo,
        addressTownCity: inputs.fulfilmentOrigin.addressTownCity,
        addressPostCode: inputs.fulfilmentOrigin.addressPostCode,
        addressCountryCode: 'UK',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      newAddress = await Address.findOne(existingAddress.id);
    }

    // Update fulfilment method
    let fulfilmentMethod = await FulfilmentMethod.update({ id: inputs.id }).set(
      {
        priceModifier: inputs.priceModifier,
        slotLength: inputs.slotLength,
        bufferLength: inputs.bufferLength,
        orderCutoff: inputs.orderCutoff,
        maxOrders: inputs.maxOrders,
        maxDeliveryDistance: inputs.maxDeliveryDistance,
        fulfilmentOrigin: newAddress.id,
      }
    );

    // Update all opening hours
    inputs.openingHours.forEach(async (hours) => {
      const { id, ..._hoursOmitId } = hours;
      await OpeningHours.update({ id: id }).set({
        _hoursOmitId,
      });
    });

    return exits.success(fulfilmentMethod);
  },
};
