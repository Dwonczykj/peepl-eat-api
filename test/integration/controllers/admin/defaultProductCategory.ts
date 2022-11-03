import { CategoryGroupType, ProductCategoryType } from '../../../../scripts/utils';
import { v4 as uuidv4 } from 'uuid';
import { NEW_MODEL_OBJECT_TYPE } from '../../../newModelObject';

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


