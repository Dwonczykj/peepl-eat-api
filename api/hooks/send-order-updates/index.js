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
              completedFlag: 'none',
            },
            {
              fulfilmentSlotFrom: {
                '<=': new Date().addHours(1.1)
              },
              completedFlag: 'none',
            },
          ]
        });

        var recentOrders = await Order.find({
          and: [
            {
              fulfilmentSlotFrom: {
                '<=': new Date()
              },
              completedFlag: 'none',
            },
            {
              fulfilmentSlotFrom: {
                '>=': new Date().addHours(-1.1)
              },
              completedFlag: 'none',
            },
          ]
        });

        var formatDeliverySlot = function (dateTime) {
          if (!dateTime) {
            return '';
          }
          dateTime = moment(dateTime).calendar(null, {
            lastDay: '[Yesterday]',
            // sameDay: '[Today]',
            sameDay: function (now) {
              if (this.isBefore(now)) {
                return '[Will Happen Today]';
              } else {
                return '[Happened Today]';
              }
            },
            nextDay: '[Tomorrow]',
            lastWeek: '[last] dddd',
            nextWeek: 'dddd',
            sameElse: 'DD/MM/YYYY', // ~ https://momentjs.com/docs/#/displaying/calendar-time/
          }); // ~ https://stackoverflow.com/a/41260094
          return dateTime;
        };

        // eslint-disable-next-line no-unused-vars
        var formatOrderedTime = function (unixtime) {
          if (!unixtime) {
            return '';
          }
          unixtime = moment.unix(Math.round(unixtime / 1000)).calendar(null, {
            lastDay: '[Yesterday]',
            // sameDay: '[Today]',
            sameDay: function (now) {
              if (this.isBefore(now)) {
                return '[Will Happen Today]';
              } else {
                return '[Happened Today]';
              }
            },
            nextDay: '[Tomorrow]',
            lastWeek: '[last] dddd',
            nextWeek: 'dddd',
            sameElse: 'DD/MM/YYYY', // ~ https://momentjs.com/docs/#/displaying/calendar-time/
          }); // ~ https://stackoverflow.com/a/41260094
          return unixtime;
        };

        const recentOrderPromises = recentOrders.map(order => {
          return async () => {
            var ds = formatDeliverySlot(order.fulfilmentSlotFrom);
            var delivColln = order.fulfilmentMethod.methodType === 'delivery' ? 'delivery' : 'collection';
            var completed = order.completedFlag === 'completed' ? 'complete' : 'in progress';
            // No need to await result of this
            await sails.helpers.broadcastFirebaseNotificationForTopic.with({
              topic: 'order-' + order.publicId,
              title: `Order update - ${completed}`,
              body: `Your recent order scheduled for ${delivColln} at ${ds} is ${completed}.`
            });
          }
        });

        await Promise.all(recentOrderPromises);

        var recentOrderIds = recentOrders.map(order => order.id);

        const upcomingOrderPromises = upcomingOrders.map((order) => {
          return async () => {
            if (!recentOrderIds.includes(order.id)) {
              var ds = formatDeliverySlot(order.fulfilmentSlotFrom);
              var delivColln = order.fulfilmentMethod.methodType === 'delivery' ? 'delivery' : 'collection';
              // No need to await result of this
              await sails.helpers.broadcastFirebaseNotificationForTopic.with({
                topic: 'order-' + order.publicId,
                title: 'Order update',
                body: `You have an upcoming order at ${ds} scheduled for ${delivColln} 😎.`
              });
            }
          };
        });

        await Promise.all(upcomingOrderPromises);
      });
    }
  };
};
