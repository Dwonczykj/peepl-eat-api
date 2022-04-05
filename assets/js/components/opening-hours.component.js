/**
 * <edit-discount>
 * -----------------------------------------------------------------------------
 * Edit discount component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('openingHours', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'fulfilment-method',
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      syncing: false,
      formRules: {
        code: {
          required: true
        },
        percentage: {
          required: true
        }
      },
      formErrors: {
      },
      cloudError: '',
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
    <ajax-form :form-data="fulfilmentMethod" :syncing.sync="syncing" :form-errors.sync="formErrors" :cloud-error.sync="cloudError" :action="'updateOpeninghours'">
        <div class="my-3 p-3 p-md-4 rounded action-card" v-for="(hours, index) in fulfilmentMethod.openingHours">
            <details>
            <summary class="action-card__summary">
                <span class="action-card__checkbox">
                <input type="checkbox" :id=hours.dayOfWeek v-model="hours.isOpen">
                </span>
                <span :class="{'line-through': !hours.isOpen }">{{hours.dayOfWeek | capitalise}}</span> <div v-if="hours.isOpen" class="text-muted ml-1">{{hours.openTime}} - {{hours.closeTime}}</div>
            </summary>
            <div class="action-card__content">
                <br/>
                <label for="appt">Select opening time:</label>
                <input type="time" id="appt" name="appt" v-model="hours.openTime" :disabled="!hours.isOpen">
                <label for="appt">Select closing time:</label>
                <input type="time" id="appt" name="appt" v-model="hours.closeTime" :disabled="!hours.isOpen">
            </div>
            </details>
        </div>
        <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
    </ajax-form>
    `,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function(){
    //…
  },
  beforeDestroy: function() {
    //…
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
    //…
  }
});
  