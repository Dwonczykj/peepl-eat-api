import { AvailableDateOpeningHours } from "../../../api/helpers/get-available-dates";
import { FulfilmentMethodType } from "../../../scripts/utils";

export interface GetEligibleOrderUpdates {
  vendor: number;
  deliveryPartner?: number;
}

export interface getEligibleOrderDatesSuccess {
  eligibleCollectionDates: AvailableDateOpeningHours;
  eligibleDeliveryDates: AvailableDateOpeningHours;
  deliveryMethod: FulfilmentMethodType;
  collectionMethod: FulfilmentMethodType;
}
