// const bcrypt = require('bcrypt');
/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

// import userModel = require('./UserModel');

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    email: {
      type: 'string',
      isEmail: true,
      // unique: true,
      required: false,
    }, //TODO: Run a clean on the db to make this
    phoneNoCountry: {
      type: 'number',
      // unique: true,
      required: true,
    },
    phoneCountryCode: {
      type: 'number',
      // unique: true,
      required: true,
    },
    // password: {
    //   type: 'string',
    //   required: true,
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
      isIn: ['admin', 'vendor', 'courier', 'consumer'],
      required: true,
    },
    vendorRole: {
      type: 'string',
      isIn: ['admin', 'owner', 'inventoryManager', 'salesManager', 'none'],
      defaultsTo: 'none'
    },
    courierRole: {
      type: 'string',
      isIn: ['admin', 'owner', 'deliveryManager', 'rider', 'none'],
      defaultsTo: 'none'
    },
    roleConfirmedWithOwner: {
      type: 'boolean',
      defaultsTo: false, //TODO: Add API Endpoint to toggle this to true for admins and owners registered to that business.
    },
    vendorConfirmed: {
      type: 'boolean',
      defaultsTo: false,
    },
    // firebaseUser: { // https://sailsjs.com/documentation/concepts/models-and-orm/attributes#:~:text=%23-,Type,-%23
    //   type: 'json', // https://sailsjs.com/documentation/concepts/models-and-orm/associations
    // }
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },
    fbUid: {
      type: 'string',
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor'
    },
    courier: {
      model: 'courier'
    },
  },
  //} /*as { [K in keyof userModel]: any },

  // customToJSON: function() {
  //   return _.omit(this, ['password']);
  // },

  formatPhoneNumber: async function (opts) {
    const user = await User.findOne({ id: opts.id });

    if (!user) {
      throw require('flaverr')({
        message: `Cannot find user with id=${opts.id}.`,
        code: 'E_UNKNOWN_USER'
      });
    }

    var x = user.phoneNoCountry.toString();
    x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
    x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
    return `+${user.phoneCountryCode} ${x}`;
  },

  beforeCreate: async function(user, proceed) {

    const existingUser = await User.findOne({
      phoneNoCountry: user.phoneNoCountry,
      phoneCountryCode: user.phoneCountryCode,
    });

    if(existingUser){
      // throw new Error('userExists');
      return undefined;
    }

    const nonNull = (val) => val !== null && val !== undefined && val !== -1;
    const isNull = (val) => val === null || val === undefined || val === -1;

    const setRoles = () => {
      if(nonNull(user.courier) && nonNull(user.vendor)){
        return undefined; //TODO: Throw Exception on creation here
      } else if (nonNull(user.vendor) && (isNull(user.vendorRole) || !['owner', 'salesManager', 'inventoryManager'].includes(user.vendorRole)) ){
        user.vendor = null;
        return undefined; //todo throw
      } else if (nonNull(user.courier) && (isNull(user.courierRole) || !['owner', 'deliveryManager', 'rider'].includes(user.courierRole)) ){
        user.courier = null;
        return undefined; //todo throw
      }

      if (nonNull(user.vendor)){
        user.role = 'vendor';
        user.courierRole = 'none';
        user.courier = null;
      } else if (nonNull(user.courier)){
        user.role = 'courier';
        user.vendorRole = 'none';
        user.vendor = null;
      } else if (!user.isSuperAdmin){
        user.role = 'consumer';
        user.vendorRole = 'none';
        user.courierRole = 'none';
        user.vendor = null;
        user.courier = null;
      }
      return user;
    };

    if(user.isSuperAdmin){
      user.role = 'admin';
      user.vendorRole = 'admin';
      user.courierRole = 'admin';
    } else if(user.role === 'admin' && !user.isSuperAdmin){
      user = setRoles();
    }

    if (user.role !== 'vendor'){
      user.vendorRole = 'none';
      user.vendor = null;
    }
    if (user.role !== 'courier'){
      user.courierRole = 'none';
      user.courier = null;
    }

    return proceed();
  }

};
