import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import { v4 as uuidv4 } from 'uuid';
const { fixtures } = require('../../../../scripts/build_db.js');
import { HttpAuthTestSenderVendor } from '../../controllers/vendors/defaultVendor.js';
import {
  ProductCategoryType,
} from '../../../../scripts/utils';

import { DEFAULT_NEW_PRODUCT_CATEGORY_OBJECT } from './defaultProductCategory';
import { SailsModelType } from '../../../../api/interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;

export const createProductCategories = async (
  fixtures,
  numberOfObjects: number,
  overrides: { [k: string]: any } = {}
) => {
  numberOfObjects = Math.max(1, numberOfObjects);

  const _objs = new Array(numberOfObjects)
    .fill(null)
    .map((unusedNull, unusedInd) =>
      DEFAULT_NEW_PRODUCT_CATEGORY_OBJECT(fixtures, {
        ...{},
        ...overrides,
      })
    );

  const newObjs: Array<ProductCategoryType> = await ProductCategory.createEach(_objs).fetch();

  return {
    productCategories: newObjs,
  };
};

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

class CAN_CREATE_PRODUCT_CATEGORIES {
  static readonly useAccount = 'TEST_ADMIN';
  static readonly HTTP_TYPE = 'post';
  static readonly ACTION_PATH = 'admin';
  static readonly ACTION_NAME = 'create-product-category';
  static readonly ACTION_TEST_DESCRIPTION = 'Can create a product category'
  static readonly EXPECT_STATUS_CODE = 200;

  constructor() {}

  async init(fixtures) {
    return {
      useAccount: CAN_CREATE_PRODUCT_CATEGORIES.useAccount,
      HTTP_TYPE: CAN_CREATE_PRODUCT_CATEGORIES.HTTP_TYPE,
      ACTION_PATH: CAN_CREATE_PRODUCT_CATEGORIES.ACTION_PATH,
      ACTION_NAME: CAN_CREATE_PRODUCT_CATEGORIES.ACTION_NAME,
      sendData: {
        name: 'New Product Category ' + uuidv4().substring(0, 5),
        categoryGroup: fixtures.categoryGroups[0].id,
        vendor: fixtures.vendors[0].id,
        imageUrl: '',
        products: [],
      },
      expectResponse: {},
      expectStatusCode: CAN_CREATE_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: {
          body: {
            newProductCategory: ProductCategoryType;
          };
        },
        requestPayload
      ) => {
        expect(response.body).to.have.property('newProductCategory');
        expect(response.body.newProductCategory).to.have.property('name');
        expect(response.body.newProductCategory).to.have.property(
          'categoryGroup'
        );

        expect(response.body.newProductCategory.name).to.equal(
          requestPayload.name
        );

        const newProductCategory = await ProductCategory.findOne(response.body.newProductCategory.id).populate('vendor&categoryGroup');
        assert.isDefined(newProductCategory);
        assert.isObject(newProductCategory);
        expect(newProductCategory).to.have.property('name');
        expect(response.body.newProductCategory.name).to.equal(
          requestPayload.name
        );
        expect(newProductCategory).to.have.property('vendor');
        expect(newProductCategory.vendor.id).to.equal(
          requestPayload.vendor
        );
        expect(newProductCategory).to.have.property('name');
        expect(newProductCategory.categoryGroup.id).to.equal(
          requestPayload.categoryGroup
        );

        return;
      },
    };
  }
}

describe(`${CAN_CREATE_PRODUCT_CATEGORIES.ACTION_NAME}() returns a ${CAN_CREATE_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE} with json when authenticated as ${CAN_CREATE_PRODUCT_CATEGORIES.useAccount}`, () => {
  it(`${CAN_CREATE_PRODUCT_CATEGORIES.ACTION_TEST_DESCRIPTION}`, async () => {
    try {
      const _hatsInit = await new CAN_CREATE_PRODUCT_CATEGORIES().init(fixtures);
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
