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
      // deliveryRestrictionDetails: '',
      status: 'draft',
      products: []
    },
    colFul: {},
    delFul: {},
    postalDistricts: [],
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
      }
    },
    fulfilmethod: 'col'
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
  filters: {
    capitalise: function(value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
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
    },
    updatePostalDistricts: function() {
      var postalDistricts = this.postalDistricts.filter(district => district.checked).map((a)=>{return a.id;});
      return {districts: postalDistricts, vendorId: this.vendor.id};
    }
  },
});
