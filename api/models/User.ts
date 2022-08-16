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
    phone: {
      type: 'string',
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
      isIn: ['owner', 'staff', 'courier'], // ! Not user anywhere at the moment
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
    // firebaseUser: { // https://sailsjs.com/documentation/concepts/models-and-orm/attributes#:~:text=%23-,Type,-%23
    //   type: 'json', // https://sailsjs.com/documentation/concepts/models-and-orm/associations
    // }
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },

  },
  //} /*as { [K in keyof userModel]: any },

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
