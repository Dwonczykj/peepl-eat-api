export interface RootObject {
  vendors: Vendor[];
}

export interface Vendor {
  collectionFulfilmentMethod: number;
  costLevel: null;
  createdAt: number;
  deliveryFulfilmentMethod: number;
  deliveryPartner: number | null;
  description: string;
  id: number;
  imageUrl: string;
  isVegan: boolean;
  minimumOrderAmount: number;
  name: string;
  phoneNumber: string;
  pickupAddressCity: null | string;
  pickupAddressLineOne: null | string;
  pickupAddressLineTwo: null;
  pickupAddressPostCode: null | string;
  platformFee: number;
  rating: number;
  status: Status;
  type: Type;
  updatedAt: number;
  walletAddress: string;
}

export enum Status {
  Active = "active",
  Draft = "draft",
  Inactive = "inactive",
}

export enum Type {
  Restaurant = "restaurant",
}
