import _ from 'lodash';
// import bcrypt from 'bcrypt';
/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import { UserType, SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<UserType> & { formatPhoneNumber?: (unusedOpts:{id: UserType["id"]}) => any; } = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    email: {
      type: 'string',
      isEmail: true,
      unique: true,
      required: true,
    },
    phoneNoCountry: {
      type: 'number',
      required: true,
    },
    phoneCountryCode: {
      type: 'number',
      required: true,
    },
    marketingPushContactAllowed: {
      type: 'number',
      required: true,
    },
    marketingEmailContactAllowed: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
    },
    marketingPhoneContactAllowed: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
    },
    marketingNotificationUtility: {
      type: 'number',
      required: false,
      columnType: 'INT',
      defaultsTo: 0,
      min: -1,
    },
    // password: {
    //   type: "string",
    //   required: true,
    //   description:
    //     "Securely hashed representation of the user's login password.",
    //   protect: true,
    //   example: "2$28a8eabna301089103-13948134nad",
    // },
    name: {
      type: 'string',
      required: true,
    },
    isSuperAdmin: {
      type: 'boolean',
      defaultsTo: false,
    },
    role: {
      type: 'string',
      isIn: ['admin', 'vendor', 'deliveryPartner', 'consumer'],
      required: true,
    },
    vendorRole: {
      type: 'string',
      isIn: ['admin', 'owner', 'inventoryManager', 'salesManager', 'none'],
      defaultsTo: 'none',
    },
    deliveryPartnerRole: {
      type: 'string',
      isIn: ['admin', 'owner', 'deliveryManager', 'rider', 'none'],
      defaultsTo: 'none',
    },
    roleConfirmedWithOwner: {
      type: 'boolean',
      defaultsTo: false, //TODO: Add API Endpoint to toggle this to true for admins and owners registered to that business.
    },
    vendorConfirmed: {
      type: 'boolean',
      defaultsTo: false,
    },
    fbUid: {
      type: 'string',
    },
    firebaseSessionToken: {
      type: 'string',
      required: false,
      defaultsTo: '',
      allowNull: true,
    },
    secret: {
      type: 'string',
      required: false,
      allowNull: true,
      description:
        "Securely hashed representation of the service account's secret.",
      protect: true,
      example: '2$28a8eabna301089103-13948134nad',
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
    },
    deliveryPartner: {
      model: 'deliverypartner',
    },
  },
  //} /*as { [K in keyof userModel]: any },

  customToJSON: function () {
    sails.log.info(
      'firebaseSessionToken, secret & password token removed from user JSON'
    );
    return _.omit(this, ['firebaseSessionToken', 'secret', 'password']);
  },

  formatPhoneNumber: async function (opts) {
    const user = await User.findOne({ id: opts.id });

    if (!user) {
      throw require('flaverr')({
        message: `Cannot find user with id=${opts.id}.`,
        code: 'E_UNKNOWN_USER',
      });
    }

    var x = user.phoneNoCountry.toString();
    x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
    x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
    return `+${user.phoneCountryCode} ${x}`;
  },

  beforeCreate: async function (userDraft, proceed) {
    // const saltRounds = sails.config.custom.saltRounds;

    // try {
    //   user.firebaseSessionToken = await bcrypt.hash(user.firebaseSessionToken, saltRounds);
    // } catch (err) {
    //   throw err;
    // }

    userDraft.marketingNotificationUtility = Math.round(
      Math.max(-1, userDraft.marketingNotificationUtility)
    ) as UserType['marketingNotificationUtility'];

    const existingUser = await User.findOne({
      phoneNoCountry: userDraft.phoneNoCountry,
      phoneCountryCode: userDraft.phoneCountryCode,
    });

    if (existingUser) {
      // throw new Error('userExists');
      return undefined;
    }

    const nonNull = (val) => val !== null && val !== undefined;
    const isNull = (val) => val === null || val === undefined;

    const setRoles = () => {
      if (nonNull(userDraft.deliveryPartner) && nonNull(userDraft.vendor)) {
        return undefined; //TODO: Throw Exception on creation here
      } else if (
        nonNull(userDraft.vendor) &&
        (isNull(userDraft.vendorRole) ||
          !['owner', 'salesManager', 'inventoryManager'].includes(
            userDraft.vendorRole
          ))
      ) {
        userDraft.vendor = null;
        return undefined; //todo throw
      } else if (
        nonNull(userDraft.deliveryPartner) &&
        (isNull(userDraft.deliveryPartnerRole) ||
          !['owner', 'deliveryManager', 'rider'].includes(
            userDraft.deliveryPartnerRole
          ))
      ) {
        userDraft.deliveryPartner = null;
        return undefined; //todo throw
      }

      if (nonNull(userDraft.vendor)) {
        userDraft.role = 'vendor';
        userDraft.deliveryPartnerRole = 'none';
        userDraft.deliveryPartner = null;
      } else if (nonNull(userDraft.deliveryPartner)) {
        userDraft.role = 'deliveryPartner';
        userDraft.vendorRole = 'none';
        userDraft.vendor = null;
      } else if (!userDraft.isSuperAdmin) {
        userDraft.role = 'consumer';
        userDraft.vendorRole = 'none';
        userDraft.deliveryPartnerRole = 'none';
        userDraft.vendor = null;
        userDraft.deliveryPartner = null;
      }
      return userDraft;
    };

    if (userDraft.isSuperAdmin) {
      userDraft.role = 'admin';
      userDraft.vendorRole = 'admin';
      userDraft.deliveryPartnerRole = 'admin';
    } else if (userDraft.role === 'admin' && !userDraft.isSuperAdmin) {
      userDraft = setRoles();
    }

    if (userDraft.role !== 'vendor') {
      userDraft.vendorRole = 'none';
      userDraft.vendor = null;
    }
    if (userDraft.role !== 'deliveryPartner') {
      userDraft.deliveryPartnerRole = 'none';
      userDraft.deliveryPartner = null;
    }

    return proceed();
  },
};

module.exports = _exports;
