export type NEW_MODEL_OBJECT_TYPE<T> = (
  fixtures,
  overrides: {
    [key in Exclude<keyof T, 'id'>]?: T[key];
  }
) => {
  [key in Exclude<keyof T, 'id'>]: T[key];
};
