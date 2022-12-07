/**
 * send-logistics-emails hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineSendLogisticsEmailsHook(sails) {

  return {

    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function () {
      sails.log.info('Initializing custom hook (`send-logistics-emails`)');
      var cron = require('node-cron');

      cron.schedule('0 0 * * *', async () => {
        // Get all the delivery partners
        var deliveryPartners = await DeliveryPartner.find({status: 'active'})
        .populate('deliveryFulfilmentMethod');

        // Loop through the delivery partners
        deliveryPartners.forEach(async (deliveryPartner) => {
          var today = new Date();
          var tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          var orderCriteria = {
            paymentStatus: 'paid',
            restaurantAcceptanceStatus: 'accepted',
            sentToDeliveryPartner: false,
            fulfilmentMethod: deliveryPartner.deliveryFulfilmentMethod.id,
            fulfilmentSlotFrom: {
              '>=': today,
              '<=': tomorrow
            },
            completedFlag: '',
          };

          // Find orders that have not yet been sent to the delivery partner due to be fulfilled in the next 24 hours
          var orders = await Order.find(orderCriteria)
          .populate('vendor&fulfilmentMethod&items.product&optionValues&optionValues.option&optionValue');

          if(orders.length > 0) {
            // Send an email to the delivery partner with all orders
            await sails.helpers.sendTemplateEmail.with({
              to: deliveryPartner.email,
              toName: deliveryPartner.name,
              from: sails.config.custom.internalEmailAddress,
              fromName: 'vegi',
              subject: 'Your vegi orders for collection',
              template: 'email-logistics-notification',
              templateData: {
                orders: orders,
                deliveryPartner: deliveryPartner,
              },
            });

            // Mark all of the orders as sent to the delivery partner
            await Order.update(orderCriteria).set({
              sentToDeliveryPartner: true,
            });
          }
        });
      });
    }
  };
};
