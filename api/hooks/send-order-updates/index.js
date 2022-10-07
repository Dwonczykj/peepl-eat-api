/**
 * send-order-updates hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs    :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

var moment = require('moment');

module.exports = function defineSendOrderUpdatesHook(sails) {

  return {

    /**
           * Runs when this Sails app loads/lifts.
           */
    initialize: async function () {
      sails.log.info('Initializing custom hook (`send-order-updates`)');
      var cron = require('node-cron');

      cron.schedule('0 * * * *', async () => { // https://crontab.cronhub.io/
        var upcomingOrders = await Order.find({
          and: [
            {
              fulfilmentSlotFrom: {
                '>=': new Date()
              },
              completedFlag: '',
            },
            {
              fulfilmentSlotFrom: {
                '<=': new Date().addHours(1.1)
              },
              completedFlag: '',
            },
          ]
        });

        var recentOrders = await Order.find({
          and: [
            {
              fulfilmentSlotFrom: {
                '<=': new Date()
              },
              completedFlag: '',
            },
            {
              fulfilmentSlotFrom: {
                '>=': new Date().addHours(-1.1)
              },
              completedFlag: '',
            },
          ]
        });

        var formatDeliverySlot = function (dateTime) {
          if (!dateTime) { return ''; }
          dateTime = moment(dateTime).calendar();
          return dateTime;
        };

        // eslint-disable-next-line no-unused-vars
        var formatOrderedTime = function (unixtime) {
          if (!unixtime) { return ''; }
          unixtime = moment.unix(Math.round(unixtime / 1000)).calendar();
          return unixtime;
        };

        recentOrders.forEach(order => {
          var ds = formatDeliverySlot(order.fulfilmentSlotFrom);
          var delivColln = order.fulfilmentMethod.methodType === 'delivery' ? 'delivery' : 'collection';
          var completed = order.completedFlag === 'completed' ? 'complete' : 'in progress';
          // No need to await result of this
          sails.helpers.sendFirebaseNotification.with({
            topic: 'order-' + order.publicId,
            title: `Order update - ${completed}`,
            body: `Your recent order scheduled for ${delivColln} at ${ds} is ${completed}.`
          });
        });

        var recentOrderIds = recentOrders.map(order => order.id);

        upcomingOrders.forEach(order => {
          if (!recentOrderIds.includes(order.id)) {
            var ds = formatDeliverySlot(order.fulfilmentSlotFrom);
            var delivColln = order.fulfilmentMethod.methodType === 'delivery' ? 'delivery' : 'collection';
            // No need to await result of this
            sails.helpers.sendFirebaseNotification.with({
              topic: 'order-' + order.publicId,
              title: 'Order update',
              body: `You have an upcoming order at ${ds} scheduled for ${delivColln} 😎.`
            });
          }
        });
      });
    }
  };
};
