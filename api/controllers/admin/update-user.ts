import { UserRecord } from 'firebase-admin/auth';
import * as firebase from '../../../config/firebaseAdmin';
import {
  UserDeliveryPartnerRoleLiteral,
  UserRoleLiteral,
  UserVendorRoleLiteral,
  UserType,
  DeliveryPartnerType,
  walletAddressString,
} from '../../../scripts/utils';
import { sailsVegi, SailsModelType } from '../../interfaces/iSails';
declare var sails: sailsVegi;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;
declare var User: SailsModelType<UserType>;

module.exports = {
  friendlyName: 'Update User Vendor Role',

  description:
    'Update the role of the user at the vendor they are registered to',

  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    name: {
      type: 'string',
    },
    role: {
      type: 'string',
      isIn: [
        'admin',
        'vendor',
        'deliveryPartner',
        'consumer',
      ] as Array<UserRoleLiteral>,
    },
    password: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    vendorId: {
      type: 'number',
      required: false,
    },
    vendorRole: {
      type: 'string',
      isIn: [
        'owner',
        'inventoryManager',
        'salesManager',
        'deliveryPartner',
        'none',
      ] as Array<UserVendorRoleLiteral>,
    },
    vendorConfirmed: {
      type: 'boolean',
    },
    roleConfirmedWithOwner: {
      type: 'boolean',
      defaultsTo: false,
    },
    deliveryPartnerId: {
      type: 'number',
      required: false,
    },
    deliveryPartnerRole: {
      type: 'string',
      isIn: [
        'owner',
        'deliveryManager',
        'rider',
        'none',
      ] as Array<UserDeliveryPartnerRoleLiteral>,
    },
    walletAddress: {
      type: 'string',
      required: false,
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      outputDescription: '`User`s vendor role has been successfully updated.',
      outputExample: {},
    },
    badRequest: {
      description: 'VendorRole passed does not exist.',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no vendor with that ID!',
      responseType: 'notFound',
    },
    unauthorised: {
      description: 'You are not authorised to have a role with this vendor.',
      responseType: 'unauthorised',
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 401,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
  },

  fn: async function (
    inputs: {
      name: string;
      role: UserRoleLiteral;
      email: string;
      password?: string;
      vendorId?: number;
      vendorRole?: UserVendorRoleLiteral;
      vendorConfirmed?: boolean;
      roleConfirmedWithOwner?: boolean;
      deliveryPartnerId?: number;
      deliveryPartnerRole?: UserDeliveryPartnerRoleLiteral;
      walletAddress: walletAddressString | "",
    },
    exits: {
      success: (unusedArg?: { updatedUserId: number }) => void;
      badRequest: (unusedArg?: any) => void;
      notFound: () => void;
      unauthorised: () => void;
      firebaseErrored: (unusedArg?: any) => void;
    }
  ) {
    // TODO: Integration Test this
    const myUser = await User.findOne({
      id: this.req.session.userId,
    });
    if (!myUser) {
      this.res.redirect('/');
      return exits.notFound();
    }

    const userToUpdate = await User.findOne({ email: inputs.email });

    if (!userToUpdate) {
      return exits.notFound();
    } else if (!userToUpdate.fbUid) {
      sails.log.warn(
        `User with email: ${userToUpdate.email} not linked to firebase account`
      );
      // return exits.notFound();
    }

    if (userToUpdate.id !== myUser.id) {
      const isSuperAdmin = await sails.helpers.isSuperAdmin.with({
        userId: myUser.id,
      });
      if (!isSuperAdmin.data) {
        return exits.unauthorised();
      }
    }

    let updateUserObj: { [key in keyof UserType]?: UserType[key] } = {};
    if (Object.keys(inputs).includes('name')) {
      updateUserObj['name'] = inputs.name;
    }
    if (Object.keys(inputs).includes('walletAddress') && inputs.walletAddress) {
      const walletAddressPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
      if (inputs.walletAddress.match(walletAddressPattern)) {
        updateUserObj['walletAddress'] = inputs.walletAddress;
      }
    }
    if (Object.keys(inputs).includes('role')) {
      updateUserObj['role'] = inputs.role;
    }

    // Set user.vendor
    if (Object.keys(inputs).includes('vendorId')) {
      //TODO: Check that the user is registered to a vendor and that it matches the vendor in the inputs (request)
      let vendor = await Vendor.findOne({ id: inputs.vendorId });

      if (!vendor) {
        return exits.notFound();
      }
      // Check if admin user is authorised to edit vendor.
      const isAuthorisedForVendor =
        await sails.helpers.isAuthorisedForVendor.with({
          userId: this.req.session.userId,
          vendorId: vendor.id,
        });

      if (!isAuthorisedForVendor) {
        return exits.unauthorised();
      }

      if (
        !['owner', 'inventoryManager', 'salesManager', 'none'].includes(
          inputs.vendorRole
        )
      ) {
        return exits.badRequest();
      }

      updateUserObj['vendorRole'] = inputs.vendorRole;
      updateUserObj['vendor'] = vendor;
    }

    // Set user.deliveryPartner
    if (Object.keys(inputs).includes('deliveryPartnerId')) {
      //TODO: Check that the user is registered to a deliveryPartner and that it matches the deliveryPartner in the inputs (request)
      let deliveryPartner = await DeliveryPartner.findOne({
        id: inputs.deliveryPartnerId,
      });

      if (!deliveryPartner) {
        return exits.notFound();
      }
      // Check if admin user is authorised to edit deliveryPartner.
      const isAuthorisedForDeliveryPartner =
        await sails.helpers.isAuthorisedForDeliveryPartner.with({
          userId: this.req.session.userId,
          deliveryPartnerId: deliveryPartner.id,
        });

      if (!isAuthorisedForDeliveryPartner) {
        return exits.unauthorised();
      }

      if (
        !['owner', 'deliveryManager', 'rider', 'none'].includes(
          inputs.deliveryPartnerRole
        )
      ) {
        return exits.badRequest();
      }

      updateUserObj['deliveryPartnerRole'] = inputs.deliveryPartnerRole;
      updateUserObj['deliveryPartner'] = deliveryPartner;
    }

    await User.updateOne(userToUpdate.id).set(updateUserObj);
    //TODO: Update the user in admin
    var _userRecord: UserRecord;
    if (userToUpdate.fbUid) {
      try {
        _userRecord = await firebase.updateUser(
          userToUpdate.fbUid,
          inputs.password
            ? {
                email: userToUpdate.email,
                password: inputs.password,
                name: inputs.name,
              }
            : {
                email: userToUpdate.email,
                name: inputs.name,
              }
        );
      } catch (err) {
        sails.log.error(err);

        return exits.firebaseErrored({
          code: err.code,
          message: err.message,
          error: err,
        }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      }

      // Signed in
      const userRecord = _userRecord;

      await User.updateOne(userToUpdate.id).set({
        fbUid: userRecord.uid,
      });
    }

    // All done.
    return exits.success({
      updatedUserId: userToUpdate.id,
    });
  },
};
