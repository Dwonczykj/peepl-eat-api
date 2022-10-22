
export const DEFAULT_NEW_POSTAL_DISTRICT_OBJECT = (fixtures, overrides = {}) => {
  return {
    ...{
      outcode: "T1"
    },
    ...overrides,
  };
};
