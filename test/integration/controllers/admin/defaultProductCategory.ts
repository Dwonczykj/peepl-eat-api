import { CategoryGroupType, ProductCategoryType } from '../../../../scripts/utils';
import { v4 as uuidv4 } from 'uuid';
import { NEW_MODEL_OBJECT_TYPE } from '../../../newModelObject';
import { SailsModelType } from '../../../../api/interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;

export const DEFAULT_NEW_PRODUCT_CATEGORY_OBJECT: NEW_MODEL_OBJECT_TYPE<ProductCategoryType> = (
  fixtures,
  overrides = {}
) => {
  return {
    ...{
      name: 'New Product Category ' + uuidv4().substring(0, 5),
      categoryGroup: fixtures.categoryGroups[0].id,
      imageUrl: '',
      products: [],
      vendor: fixtures.vendors[0].id
    },
    ...overrides,
  };
};

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

  const newObjs: Array<ProductCategoryType> = await ProductCategory.createEach(
    _objs
  ).fetch();

  return {
    productCategories: newObjs,
  };
};
