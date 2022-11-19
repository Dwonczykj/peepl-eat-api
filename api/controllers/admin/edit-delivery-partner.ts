import { sailsModelKVP, SailsModelType } from '../../../api/interfaces/iSails';
import { AddressType, DeliveryPartnerType } from "../../../scripts/utils";

declare var Address: SailsModelType<AddressType>;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;

module.exports = {
  friendlyName: 'Edit delivery partner',

  description: '',

  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The id of the delivery partner to edit',
    },
    name: {
      type: 'string',
      required: true,
      description: 'The name of the delivery partner',
      maxLength: 50,
    },
    email: {
      type: 'string',
      required: true,
      description: 'The email address of the delivery partner',
      maxLength: 50,
      isEmail: true,
    },
    phoneNumber: {
      type: 'string',
      required: true,
      description: 'The phone number of the delivery partner',
      maxLength: 20,
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive',
    },
  },

  exits: {
    success: {
      description: 'Delivery partner edited.',
    },
    notFound: {
      description: 'There is no delivery partner with that ID!',
      responseType: 'notFound',
    },
    unauthorised: {
      description: 'You are not authorised to edit this vendor.',
      responseType: 'unauthorised',
    },
  },

  fn: async function (inputs, exits) {
    // Find the delivery partner to edit
    var deliveryPartner = await DeliveryPartner.findOne({
      id: inputs.id,
    });

    if (!deliveryPartner) {
      return exits.notFound();
    }
    
    // var coordinates = {
    //   lat: 0.0,
    //   lng: 0.0
    // };
    // if (
    //   inputs.deliveryOriginAddress &&
    //   inputs.deliveryOriginAddress.addressLineOne &&
    //   inputs.deliveryOriginAddress.addressPostCode
    // ) {
    //   const _coordinates = await sails.helpers.getCoordinatesForAddress.with({
    //     addressLineOne: inputs.deliveryOriginAddress.addressLineOne,
    //     addressLineTwo: inputs.deliveryOriginAddress.addressLineTwo,
    //     addressTownCity: inputs.deliveryOriginAddress.addressTownCity,
    //     addressPostCode: inputs.deliveryOriginAddress.addressPostCode,
    //     addressCountryCode: 'UK',
    //   });
    //   if(_coordinates){
    //     coordinates = _coordinates;
    //   }
    // }

    // let existingAddress = await Address.findOne({
    //   deliveryPartner: inputs.id
    // });
    // let newAddress: AddressType | sailsModelKVP<AddressType>;
    // if (!existingAddress) {
    //   newAddress = await Address.create({
    //     deliveryPartner: inputs.id,
    //     label: 'Delivery Hub',
    //     addressLineOne: inputs.deliveryOriginAddress.addressLineOne,
    //     addressLineTwo: inputs.deliveryOriginAddress.addressLineTwo,
    //     addressTownCity: inputs.deliveryOriginAddress.addressTownCity,
    //     addressPostCode: inputs.deliveryOriginAddress.addressPostCode,
    //     addressCountryCode: 'UK',
    //     latitude: coordinates.lat,
    //     longitude: coordinates.lng,
    //   }).fetch();
    // } else {
    //   await Address.update(existingAddress.id).set({
    //     deliveryPartner: inputs.id,
    //     label: 'Delivery Hub',
    //     addressLineOne: inputs.deliveryOriginAddress.addressLineOne,
    //     addressLineTwo: inputs.deliveryOriginAddress.addressLineTwo,
    //     addressTownCity: inputs.deliveryOriginAddress.addressTownCity,
    //     addressPostCode: inputs.deliveryOriginAddress.addressPostCode,
    //     addressCountryCode: 'UK',
    //     latitude: coordinates.lat,
    //     longitude: coordinates.lng,
    //   });
    //   newAddress = await Address.findOne(existingAddress.id);
    // }

    // Update the delivery partner
    await DeliveryPartner.updateOne({
      id: inputs.id,
    }).set({
      name: inputs.name,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber,
      status: inputs.status,
    });

    deliveryPartner = await DeliveryPartner.findOne(inputs.id);

    // Return the updated delivery partner
    // All done.
    return exits.success(deliveryPartner);
  },
};
