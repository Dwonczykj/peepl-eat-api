
export const DEFAULT_NEW_CATEGORY_GROUP_OBJECT = (fixtures, overrides = {}) => {
  return {
    ...{
      name: "New Category Group",
      forRestaurantItem: false,
      imageUrl: '',
    },
    ...overrides,
  };
};
