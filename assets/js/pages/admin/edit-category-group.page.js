parasails.registerPage('edit-category-group', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {},
    previewImageSrc: '',
    imageName: 'Choose image',
    categoryGroup: {
      name: '',
      forRestaurantItem: false,
      imageUrl: '',
    },
    formRules: {
      name: {
        required: true,
      },
    },
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {},
  mounted: async function () {
    _.extend(this, SAILS_LOCALS);
  },
  filters: {
    capitalise: function (value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    convertToPounds: function (value) {
      if (!value) {
        return '£0';
      }
      value = '£' + (value / 100).toFixed(2);
      value = value.toString();
      return value;
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    categoryGroupSubmitted: function () {
      if (!this.formErrorsExist()) {
        // this.categoryGroup.id = id;
        // window.history.pushState({}, '', '/admin/category-groups/' + id);
        window.location.replace('/admin/category-groups/');
      }
    },
    formErrorsExist: function () {
      return (
        Object.values(this.formErrors).reduce(
          (prev, cur) => prev + Number(cur),
          0
        ) > 0 || this.cloudErrorsExist()
      );
    },
    cloudErrorsExist: function () {
      return this.cloudError || this.cloudCode;
    },
    changeProductImageInput: function (files) {
      if (files.length !== 1 && !this.categoryGroup.image) {
        throw new Error(
          'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.'
        );
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.categoryGroup.image) {
        return;
      }

      this.imageName = selectedFile.name; // Used to show user which image is selected
      this.categoryGroup.image = selectedFile;
      this.formErrors.image = '';

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = (event) => {
        this.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      reader.readAsDataURL(selectedFile);
    },
  },
});
