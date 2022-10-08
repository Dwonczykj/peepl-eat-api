module.exports = [
  {
    id: 1,
    items: [
      {
        id: 1,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
      {
        id: 2,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
      {
        id: 3,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
    ],
    total: 9,
    tipAmount: 0,
    marketingOptIn: false,
    vendor: "1",
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    paidDateTime: null,
    refundDateTime: null,
    address: {
      name: "Test Runner 1",
      email: "adam@itsaboutpeepl.com",
      phoneNumber: "07905532512",
      lineOne: "11 Feck Street",
      lineTwo: "",
      postCode: "L1 0AB",
      deliveryInstructions: "Leave it behind the bin",
    },
    publicId: "",
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2022-10-12 11:00:00",
    fulfilmentSlotTo: "2022-10-12 12:00:00",
    discount: 1, //TODO: Check what the id of this should be for DELI10
    paymentStatus: "unpaid", //TODO: CHeck can update to paid|failed after object creation
    paymentIntentId: "",
    deliveryId: "",
    deliveryPartnerAccepted: false, //TODO Check can update
    deliveryPartnerConfirmed: false, //TODO Check can update,
    rewardsIssued: 0, //TODO Check can update,
    sentToDeliveryPartner: false, //TODO Check can update,
    completedFlag: false, //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
    completedOrderFeedback: null, //TODO: Check can add feedback after order
    deliveryPunctuality: null, //TODO check can be set after and has to be an INT between 0 and 5 inclusive
    orderCondition: null, // TODO check can be set after and has to be an INT between 0 and 5 inclusive
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
    parentOrder: null,
  },
  {
    id: 2,
    items: [
      {
        id: 1,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
    ],
    total: 3,
    tipAmount: 1,
    restaurantAcceptanceStatus: "accepted",
    marketingOptIn: false,
    vendor: "1",
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    paidDateTime: null,
    refundDateTime: null,
    address: {
      name: "Test Runner 1",
      email: "adam@itsaboutpeepl.com",
      phoneNumber: "07905532512",
      lineOne: "11 Feck Street",
      lineTwo: "",
      postCode: "L1 0AB",
      deliveryInstructions: "Leave it behind the bin",
    },
    publicId: "",
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2023-10-12 11:00:00",
    fulfilmentSlotTo: "2023-10-12 12:00:00",
    discount: null,
    paymentStatus: "unpaid", 
    paymentIntentId: "",
    deliveryId: "",
    deliveryPartnerAccepted: false, 
    deliveryPartnerConfirmed: false, 
    rewardsIssued: 0, 
    sentToDeliveryPartner: false, 
    completedFlag: false, 
    completedOrderFeedback: null, 
    deliveryPunctuality: null, 
    orderCondition: null, 
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, 
    parentOrder: null,
  },
  {
    id: 1,
    items: [
      {
        id: 2,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
      {
        id: 3,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
    ],
    total: 6,
    tipAmount: 0,
    marketingOptIn: false,
    vendor: "1",
    restaurantAcceptanceStatus: "rejected",
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    paidDateTime: null,
    refundDateTime: null,
    address: {
      name: "Test Runner 1",
      email: "adam@itsaboutpeepl.com",
      phoneNumber: "07905532512",
      lineOne: "11 Feck Street",
      lineTwo: "",
      postCode: "L1 0AB",
      deliveryInstructions: "Leave it behind the bin",
    },
    publicId: "",
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2002-10-12 11:00:00",
    fulfilmentSlotTo: "2002-10-12 12:00:00",
    discount: null,
    paymentStatus: "unpaid", 
    paymentIntentId: "",
    deliveryId: "",
    deliveryPartnerAccepted: false, 
    deliveryPartnerConfirmed: false, 
    rewardsIssued: 0, 
    sentToDeliveryPartner: false, 
    completedFlag: false, 
    completedOrderFeedback: null, 
    deliveryPunctuality: null, 
    orderCondition: null, 
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, 
    parentOrder: null,
  },
];
