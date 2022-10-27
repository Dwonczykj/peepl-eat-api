module.exports = {
  friendlyName: 'View dashboard',

  description: 'Display Dashboard page.',

  exits: {
    success: {
      viewTemplatePath: 'pages/home/dashboard',
    },
  },

  fn: async function (inputs: {}, exits: {
    success: (unusedArg:{}) => void;
  }) {
    return exits.success({});
  },
};
