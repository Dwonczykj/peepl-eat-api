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
                // Get all the delivery partners
                var deliveryPartners = await DeliveryPartner.find({ status: 'active' })
                    .populate('deliveryFulfilmentMethod');

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

                    if (orders.length > 0) {
                        // Send an email to the delivery partner with all orders
                        await sails.helpers.sendTemplateEmail.with({
                            to: deliveryPartner.email,
                            toName: deliveryPartner.name,
                            from: sails.config.custom.internalEmailAddress,
                            fromName: 'Vegi',
                            subject: 'Your Vegi orders for collection',
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
