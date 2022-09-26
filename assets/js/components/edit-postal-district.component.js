parasails.registerComponent('editPostalDistrict', {
  props: ['postaldistrict'],

  data: function() {
    return {
      formErrors: {},
      syncing: false,
      cloudError: '',
      formRules: {
        outcode: {
          required: true
        }
      },
    };
  },

  template: `
    <div class="my-3 p-3 p-md-4 rounded action-card">
        <details>
        <summary class="action-card__summary">
            <span>{{ (postaldistrict.outcode ? postaldistrict.outcode : "Placeholder") | capitalise }}</span> <div class="text-muted ml-1"></div>
        </summary>
        <div class="action-card__content">
            <ajax-form :cloud-error.sync="cloudError" :form-data="postaldistrict" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdPostalDistrict" :action="(postaldistrict.id) ?  'editPostalDistrict' : 'createPostalDistrict'">
                <div class="form-group mt-3">
                    <label for="postalDistrictOutcode">Outcode</label>
                    <input :class="{ 'is-invalid': formErrors.outcode }" maxlength="50" minlength="2" style="text-transform: uppercase; max-width: 10em" v-model.trim="postaldistrict.outcode" type="text" class="form-control" id="postalDistrictOutcode" required>
                </div>
                <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
                <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
                    Postal District not found.
                </div>
                <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
                    There has been an error updating the postal district. Please try again.
                </div>
            </ajax-form>
        </div>
        </details>
    </div>`,

  filters: {
    capitalise: function (value) {
      if (!value) {return ''; }
      value = value.toString();
      return value.toUpperCase();
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createdPostalDistrict: function({id}){
      Vue.set(this.postaldistrict, 'id', id);
    },
  }
});
