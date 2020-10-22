module.exports = {


  friendlyName: 'View bar menu',


  description: 'Display "Bar menu" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/bar-menu'
    }

  },


  fn: async function () {
    var products = await Product.find();
    // Respond with view.
    return {products};

  }


};
