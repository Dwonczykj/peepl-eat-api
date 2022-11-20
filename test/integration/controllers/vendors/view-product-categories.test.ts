import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
import { v4 as uuidv4 } from 'uuid';
import { SailsModelType } from '../../../../api/interfaces/iSails';
import { GetProductCategoriesSuccess } from '../../../../api/controllers/vendors/view-product-categories';
import { AddressType, CategoryGroupType, VendorType } from '../../../../scripts/utils';
const { fixtures } = require('../../../../scripts/build_db.js');
import { DEFAULT_NEW_VENDOR_OBJECT, DEFAULT_NEW_ADDRESS_OBJECT, HttpAuthTestSenderVendor } from './defaultVendor';
import { createProductCategories } from '../admin/defaultProductCategory';

declare var Vendor: SailsModelType<VendorType>;
declare var Address: SailsModelType<AddressType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;

class CAN_GET_VENDORS_PRODUCT_CATEGORIES {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME = 'view-product-categories';
  static readonly ACTION_DESCRIPTION = 'Can get all product categories for a vendor';
  static readonly EXPECT_STATUS_CODE = 200;

  constructor() {}

  async init(fixtures) {
    const newAddress = await Address.create(
      DEFAULT_NEW_ADDRESS_OBJECT(fixtures, {})
    ).fetch();
    const vendor = await Vendor.create(
      DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
        name: 'TEST_VENDOR_' + uuidv4(),
        pickupAddress: newAddress.id
      })
    ).fetch();

    let _categoryGroup = await CategoryGroup.findOne({
      name: 'General',
      forRestaurantItem: false,
    });
    if (!_categoryGroup) {
      _categoryGroup = await CategoryGroup.create({
        name: 'General',
        forRestaurantItem: false,
        imageUrl: '',
      }).fetch();
    }

    const newProductCategories = await createProductCategories(fixtures, 3, {
      vendor: vendor.id,
      categoryGroup: _categoryGroup.id,
    });

    assert.isDefined(_categoryGroup);
    assert.isDefined(vendor);
    assert.isDefined(newProductCategories);
    assert.isArray(newProductCategories.productCategories);
    expect(newProductCategories.productCategories).to.have.lengthOf(3);

    return {
      useAccount: CAN_GET_VENDORS_PRODUCT_CATEGORIES.useAccount,
      HTTP_TYPE: CAN_GET_VENDORS_PRODUCT_CATEGORIES.HTTP_TYPE,
      ACTION_PATH: CAN_GET_VENDORS_PRODUCT_CATEGORIES.ACTION_PATH,
      ACTION_NAME: CAN_GET_VENDORS_PRODUCT_CATEGORIES.ACTION_NAME,
      sendData: {
        vendor: vendor.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_VENDORS_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetProductCategoriesSuccess },
        requestPayload
      ) => {
        expect(response.body).to.have.property('productCategories');
        assert.isArray(response.body.productCategories);
        expect(response.body.productCategories).to.have.lengthOf(3);
        expect(response.body.productCategories[0]).to.have.property('name');
        expect(response.body.productCategories[0].name).to.equal(
          newProductCategories.productCategories[0].name
        );
        expect(response.body.productCategories[1].name).to.equal(
          newProductCategories.productCategories[1].name
        );
        expect(response.body.productCategories[2].name).to.equal(
          newProductCategories.productCategories[2].name
        );

        return;
      },
    };
  }
}

class CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME = 'view-product-categories';
  static readonly ACTION_DESCRIPTION = 'Returns a 404 for an unknown vendor id';
  static readonly EXPECT_STATUS_CODE = 404;

  constructor() {}

  async init(fixtures) {
    return {
      useAccount: CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.useAccount,
      HTTP_TYPE: CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.HTTP_TYPE,
      ACTION_PATH: CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.ACTION_PATH,
      ACTION_NAME: CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.ACTION_NAME,
      sendData: {
        vendor: 99999,
      },
      expectResponse: {},
      expectStatusCode:
        CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: undefined },
        requestPayload
      ) => {
        // nothing expected as 404
        return;
      },
    };
  }
}

describe(`${CAN_GET_VENDORS_PRODUCT_CATEGORIES.ACTION_NAME}() returns a 200 with json when authenticated`, () => {
  it(CAN_GET_VENDORS_PRODUCT_CATEGORIES.ACTION_DESCRIPTION, async () => {
    try {
      const _hatsInit = await new CAN_GET_VENDORS_PRODUCT_CATEGORIES().init(
        fixtures
      );
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.ACTION_NAME}() returns nothing for unknown vendor id`, () => {
  it(
    CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES.ACTION_DESCRIPTION,
    async () => {
      try {
        const _hatsInit =
          await new CANNOT_GET_UNKNOWN_VENDORS_PRODUCT_CATEGORIES().init(
            fixtures
          );
        const hats = new HttpAuthTestSenderVendor(_hatsInit);
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    }
  );
});
