const bcrypt = require('bcrypt');
/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import UserModel from './UserModel';

module.exports = {

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
      isIn: ['owner', 'staff', 'courier'], //TODO: Check with @Adam about where this is used...
    },
    vendorRole: {
      type: 'string',
      isIn: ['owner', 'inventoryManager', 'salesManager', 'courier', 'none'],
      defaultsTo: 'none'
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      // required: true,
    },
    firebaseUser: {
      type: 'object',
    }

  } as { [K in keyof UserModel]: any },

  // customToJSON: function() {
  //   return _.omit(this, ['password']);
  // },

  //Can remove as using Firebase Auth
  // beforeCreate: async function(user, cb){
  //   const saltRounds = sails.config.custom.passwordSaltRounds;

  //   try{
  //     user.password = await bcrypt.hash(user.password, saltRounds);
  //   } catch(err) {
  //     throw err;
  //   }

  //   return cb();
  // }


};
