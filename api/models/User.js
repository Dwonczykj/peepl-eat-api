const bcrypt = require('bcrypt');
/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    email: {
      type: 'string',
      isEmail: true,
      unique: true,
    },
    passwordHash: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isSuperAdmin: {
      type: 'boolean',
      defaultsTo: false,
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      required: true,
    }

  },

  customToJSON: function() {
    return _.omit(this, ['passwordHash']);
  },

  beforeCreate: async function(user, cb){
    const saltRounds = sails.config.custom.passwordSaltRounds;

    try{
      user.password = await bcrypt.hash(user.password, saltRounds);
    } catch(err) {
      throw err;
    }

    return cb();
  }


};
