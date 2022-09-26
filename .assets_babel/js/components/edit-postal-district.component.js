"use strict";

parasails.registerComponent('editPostalDistrict', {
  props: ['postaldistrict'],
  data: function data() {
    return {
      formErrors: {},
      syncing: false,
      cloudError: '',
      formRules: {
        outcode: {
          required: true
        }
      }
    };
  },
  template: "\n    <div class=\"my-3 p-3 p-md-4 rounded action-card\">\n        <details>\n        <summary class=\"action-card__summary\">\n            <span>{{ (postaldistrict.outcode ? postaldistrict.outcode : \"Placeholder\") | capitalise }}</span> <div class=\"text-muted ml-1\"></div>\n        </summary>\n        <div class=\"action-card__content\">\n            <ajax-form :cloud-error.sync=\"cloudError\" :form-data=\"postaldistrict\" :form-rules=\"formRules\" :syncing.sync=\"syncing\" :form-errors.sync=\"formErrors\" @submitted=\"createdPostalDistrict\" :action=\"(postaldistrict.id) ?  'editPostalDistrict' : 'createPostalDistrict'\">\n                <div class=\"form-group mt-3\">\n                    <label for=\"postalDistrictOutcode\">Outcode</label>\n                    <input :class=\"{ 'is-invalid': formErrors.outcode }\" maxlength=\"50\" minlength=\"2\" style=\"text-transform: uppercase; max-width: 10em\" v-model.trim=\"postaldistrict.outcode\" type=\"text\" class=\"form-control\" id=\"postalDistrictOutcode\" required>\n                </div>\n                <ajax-button class=\"btn btn-peepl mt-4\" type=\"submit\" :syncing=\"syncing\" v-bind:class=\"{ 'is-loading': syncing }\">Save changes</ajax-button>\n                <div v-if=\"cloudError === 'notFound'\" class=\"alert alert-danger mt-4\" role=\"alert\">\n                    Postal District not found.\n                </div>\n                <div v-else-if=\"cloudError\" class=\"alert alert-danger mt-4\" role=\"alert\">\n                    There has been an error updating the postal district. Please try again.\n                </div>\n            </ajax-form>\n        </div>\n        </details>\n    </div>",
  filters: {
    capitalise: function capitalise(value) {
      if (!value) {
        return '';
      }

      value = value.toString();
      return value.toUpperCase();
    }
  },
  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createdPostalDistrict: function createdPostalDistrict(_ref) {
      var id = _ref.id;
      Vue.set(this.postaldistrict, 'id', id);
    }
  }
});
