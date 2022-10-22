import { AvailableDateOpeningHours } from "../../api/helpers/get-available-dates";

export type sailsVegi = {
  helpers: {
    getAvailableDates: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<AvailableDateOpeningHours>;
    } & ((unusedArgs: Array<number>) => Promise<AvailableDateOpeningHours>);
  };
  log: any;
  config: {
    custom: { [configKey: string]: any };
  };
};
