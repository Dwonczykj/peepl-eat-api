/* eslint-disable no-undef */
// ./test/integration/helpers/is-super-admin.test.js

import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
// var util = require("util");
import moment from "moment";
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';
import { TimeWindow } from '../../../api/interfaces/vendors/slot';
import { DeliveryPartnerType, fulfilmentMethodOwnedByVendor, FulfilmentMethodType, getNextWeekday, getTodayDayName, OpeningHoursType, OrderType, UserType, VendorType } from '../../../scripts/utils';
import { createOrdersForSlot } from './db-utils';
const {
  DEFAULT_NEW_ORDER_OBJECT
} = require('../controllers/orders/defaultOrder.js');
const { fixtures } = require('../../../scripts/build_db');
import { v4 as uuidv4 } from 'uuid';

declare var User: SailsModelType<UserType>;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;
declare var Vendor: SailsModelType<VendorType>;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;
declare var OpeningHours: SailsModelType<OpeningHoursType>;
declare var Order: SailsModelType<OrderType>;
declare var sails: sailsVegi;

describe("helpers.calculateOrderTotal", () => {
  it("can calculate a simple order total", async () => {
    //todo: Create the orderitems here from products so that we have clear prices that we are chceking the values of.
    const order = await Order.create(
      DEFAULT_NEW_ORDER_OBJECT(fixtures, {
        restaurantAcceptanceStatus: 'pending',
        paymentStatus: 'paid',
        paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
        parentOrder: null,
        items: [1, 2, 3, 6, 8],
        total: 5425,
      })
    ).fetch();

    const result = await sails.helpers.calculateOrderTotal.with({
      orderId: order.id
    });

    assert.isDefined(result);
    expect(result).to.be.an('object').that.includes.all.keys([
      'finalAmount',
      'withoutFees'
    ] as Array<keyof typeof result>);

    expect(result.finalAmount).to.equal(5425); //! depends on what those items on fixtures are...
    expect(result.withoutFees).to.equal(5300); //! Depends on vendor from fixtures deliveryMethod...

    return;
  });
});
