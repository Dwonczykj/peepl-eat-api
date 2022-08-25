import { Exits, Turtle } from '../../interfaces';
module.exports = {
  friendlyName: 'Sea Turtles!',
  description: 'Turtles all the way down.',
  inputs: sails.helpers.generateSchema('turtle', 'Turtle'),
  exits: {
    error: {
      message: 'Error!'
    },
    success: {
      data: null,
      message: 'success!'
    }
  },
  fn: async function (inputs: Turtle, exits: Exits) {
    exits.success({ data: inputs });
  }
};
