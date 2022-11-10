import { SailsModelType } from "../../../api/interfaces/iSails";
import { OrderItemType, ProductType, OrderType, OrderItemOptionValueType, ProductOptionValueType, ProductOptionType } from "../../../scripts/utils";

const { assert, expect } = require('chai');
var util = require('util');
const { fixtures } = require('../../../scripts/build_db');
const {
  DEFAULT_NEW_PRODUCT_OBJECT,
  DEFAULT_NEW_PRODUCT_OPTION_OBJECT,
  DEFAULT_NEW_PRODUCT_OPTION_VALUE_OBJECT,
} = require('../controllers/admin/defaultProduct');
const {
  DEFAULT_NEW_ORDER_OBJECT,
} = require('../controllers/orders/defaultOrder');
declare var Order: SailsModelType<OrderType>;
declare var OrderItemOptionValue: SailsModelType<OrderItemOptionValueType>;
declare var OrderItem: SailsModelType<OrderItemType>;
declare var Product: SailsModelType<ProductType>;
declare var ProductOption: SailsModelType<ProductOptionType>;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;

describe('OrderItem (model)', () => {
  describe('Can Create model of type OrderItem', () => {
    let newOh;
    let fm;
    it('should create order items', async () => {
      const newProduct = await Product.create(DEFAULT_NEW_PRODUCT_OBJECT(fixtures, {
        name: `TEST_MODELS_NEW_PRODUCT`,
      })).fetch();
      const newProductOption = await ProductOption.create(
        DEFAULT_NEW_PRODUCT_OPTION_OBJECT(fixtures, {
          name: `TEST_MODELS_NEW_PRODUCT_OPT`,
        })
      ).fetch();
      const newProductOptionValue = await ProductOptionValue.create(
        DEFAULT_NEW_PRODUCT_OPTION_VALUE_OBJECT(newProductOption.id, fixtures, {
          name: `TEST_MODELS_NEW_PRODUCT_OPT`,
        })
      ).fetch();
      
      const newOrder = await Order.create(DEFAULT_NEW_ORDER_OBJECT(fixtures,{

      })).fetch();
      const newOptionValues = await OrderItemOptionValue.createEach([
        {
          option: `${newProductOption.id}`,
          optionValue: newProductOptionValue.id
        },
        {
          option: newProductOption.id,
          optionValue: newProductOptionValue.id
        },
      ]).fetch();
      const newOrderItem = await OrderItem.create({
        order: newOrder.id,
        product: newProduct.id,
        optionValues: newOptionValues.map(o => o.id),
      }).fetch();
      expect(newOrderItem).to.have.property('id');
    });
  });
});
