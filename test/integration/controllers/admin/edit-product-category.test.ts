import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import { v4 as uuidv4 } from 'uuid';
const { fixtures } = require('../../../../scripts/build_db.js');
import { HttpAuthTestSenderVendor } from '../vendors/defaultVendor';
import {
  ProductCategoryType,
} from '../../../../scripts/utils';

import { DEFAULT_NEW_PRODUCT_CATEGORY_OBJECT } from './defaultProductCategory';
import { SailsModelType } from '../../../../api/interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;

export const createProductCategories = async (
  fixtures,
  numberOfObjects: number,
  overrides: { [key in Exclude<keyof ProductCategoryType, 'id'>]?: ProductCategoryType[key] } = {}
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

class CAN_EDIT_PRODUCT_CATEGORIES {
  static readonly useAccount = 'TEST_ADMIN';
  static readonly HTTP_TYPE = 'post';
  static readonly ACTION_PATH = 'admin';
  static readonly ACTION_NAME = 'edit-product-category';
  static readonly ACTION_TEST_DESCRIPTION = 'Can edit a product category'
  static readonly EXPECT_STATUS_CODE = 200;

  constructor() {}

  async init(fixtures) {
    const {productCategories} = await createProductCategories(fixtures, 1, {
      products: fixtures.products.map(product => product.id).filter(id => [1,2].includes(id))
    });
    assert.isDefined(productCategories);
    assert.isArray(productCategories);
    expect(productCategories).to.have.lengthOf(1);
    const productCategory = await ProductCategory.findOne(
      productCategories[0].id
    ).populate('vendor&categoryGroup&products');
    assert.isArray(productCategory.products);
    expect(productCategory.products).to.have.lengthOf(2);

    return {
      useAccount: CAN_EDIT_PRODUCT_CATEGORIES.useAccount,
      HTTP_TYPE: CAN_EDIT_PRODUCT_CATEGORIES.HTTP_TYPE,
      ACTION_PATH: CAN_EDIT_PRODUCT_CATEGORIES.ACTION_PATH,
      ACTION_NAME: CAN_EDIT_PRODUCT_CATEGORIES.ACTION_NAME,
      sendData: {
        id: productCategory.id,
        name: 'Updated Product Category ' + uuidv4().substring(0, 5),
        vendor: productCategory.vendor.id,
        categoryGroup: productCategory.categoryGroup.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_EDIT_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: {
          body: {
            updatedProductCategory: ProductCategoryType;
          };
        },
        requestPayload
      ) => {
        expect(response.body).to.have.property('updatedProductCategory');
        expect(response.body.updatedProductCategory).to.have.property(
          'name'
        );
        expect(response.body.updatedProductCategory).to.have.property(
          'categoryGroup'
        );
        
        expect(response.body.updatedProductCategory.name).to.equal(
          requestPayload.name
        );

        const updatedProductCategory = await ProductCategory.findOne(
          response.body.updatedProductCategory.id
        ).populate('vendor&categoryGroup&products');
        assert.isDefined(updatedProductCategory);
        assert.isObject(updatedProductCategory);
        expect(updatedProductCategory).to.have.property('name');
        expect(updatedProductCategory.name).to.equal(
          requestPayload.name
        );
        expect(updatedProductCategory).to.have.property('vendor');
        expect(updatedProductCategory.vendor.id).to.equal(
          requestPayload.vendor
        );
        expect(updatedProductCategory).to.have.property('name');
        expect(updatedProductCategory.categoryGroup.id).to.equal(
          requestPayload.categoryGroup
        );

        expect(updatedProductCategory).to.have.property('products');
        assert.isArray(updatedProductCategory.products);
        expect(updatedProductCategory.products).to.have.lengthOf(productCategory.products.length);

        return;
      },
    };
  }
}

describe(`${CAN_EDIT_PRODUCT_CATEGORIES.ACTION_NAME}() returns a ${CAN_EDIT_PRODUCT_CATEGORIES.EXPECT_STATUS_CODE} with json when authenticated as ${CAN_EDIT_PRODUCT_CATEGORIES.useAccount}`, () => {
  it(`${CAN_EDIT_PRODUCT_CATEGORIES.ACTION_TEST_DESCRIPTION}`, async () => {
    try {
      const _hatsInit = await new CAN_EDIT_PRODUCT_CATEGORIES().init(fixtures);
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
