parasails.registerPage('admin-edit-vendor', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {
    },
    imageName: 'Choose image',
    vendor: {
      name: '',
      description: '',
      image: '',
      type: 'restaurant',
      walletAddress: '0x',
      deliveryRestrictionDetails: '',
      status: 'draft',
      products: []
    },
    openingHours: [{
        dayOfWeek: 'monday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'tuesday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'wednesday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'thursday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'friday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'saturday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
      {
        dayOfWeek: 'sunday',
        openTime: '',
        closeTime: '',
        isOpen: true
      },
    ],
    previewImageSrc: '',
    formRules: {
      name: {
        required: true,
        maxLength: 50
      },
      description: {
        maxLength: 400,
        required: true
      },
      type: {
      },
      walletAddress: {
        required: true,
        maxLength: 100,
        regex: /^0x[a-fA-F0-9]{40}$/
      },
      status: {
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
    this.vendor.image = '';
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    changeVendorImageInput: function(files) {
      if (files.length !== 1 && !this.vendor.image) {
        throw new Error('Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.');
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.vendor.image) {
        return;
      }

      this.imageName = selectedFile.name; // Used to show user which image is selected
      this.vendor.image = selectedFile;
      this.formErrors.image = '';

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = (event)=>{
        this.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      reader.readAsDataURL(selectedFile);
    },
    vendorSubmitted: function({id}) {
      this.vendor.id = id;
      window.history.pushState({}, '', '/admin/vendors/' + id);
    },
    clickAddProduct: function(){
      var newProduct = {
        name: '[Draft]',
        description: '',
        basePrice: '',
        isAvailable: false,
        image: '',
        options: []
      };

      this.vendor.products.push(newProduct);
    }
  },
});
