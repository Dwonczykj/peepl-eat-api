parasails.registerPage('admin-edit-delivery-partner', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {
    },
    deliveryPartner: {
      name: '',
      emailAddress: '',
      phoneNumber: '',
      deliveryFulfilmentMethod: {},
      status: 'inactive',
    },
    formRules: {
      name: {
        required: true,
        maxLength: 50
      },
      email: {
        maxLength: 50,
        required: true
      },
      phoneNumber: {
        required: true,
        maxLength: 20,
      },
    },
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
  },
  mounted: async function() {
    _.extend(this, SAILS_LOCALS);
  },
  filters: {
    capitalise: function(value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    convertToPounds: function (value) {
      if (!value) {return '£0';}
      value = '£' + (value/100).toFixed(2);
      value = value.toString();
      return value;
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    deliveryPartnerSubmitted: function({id}) {
      if (id) {
        this.deliveryPartner.id = id;
        window.history.pushState({}, '', '/admin/delivery-partners/' + id);
      }
    },
  },
});
