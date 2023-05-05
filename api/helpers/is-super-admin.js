module.exports = {
  friendlyName: 'Is Super Admin',

  description: 'Check if the user is a superadmin',

  inputs: {
    userId: {
      type: 'number',
      required: true,
      description: 'The id of the user.',
    },
  },

  exits: {
    success: {
      description: 'All done.',
      data: null,
    },
    catastrophicFailure: {
      description: 'Requesting User uid is not the id of a registered user',
    },
  },

  fn: async function (inputs, exits) {
    // get the user
    const user = await User.findOne({
      id: inputs.userId
    });

    if (!user) {
      sails.log.error('Requesting User uid is not the id of a registered user');
      // await exits.catastrophicFailure();
      this.res.redirect('/admin/logout');
      return exits.success({ data: false });
    }

    if (user.isSuperAdmin) {
      return exits.success({ data: true });
    }

    return exits.success({ data: false });
  },
};

