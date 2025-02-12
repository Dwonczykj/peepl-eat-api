module.exports = function(){
  return [
    {
      id: 1,
      items: [1, 2, 3, 6, 8],
      total: 5425, //* represent item values of 5300 and 124 of platform fee and 0 delivery fee base price addition
      tipAmount: 0,
      orderedDateTime: Date.now(),
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',
      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2022-10-12 11:00:00',
      fulfilmentSlotTo: '2022-10-12 12:00:00',
      discount: 1,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: '',
      deliveryPartnerAccepted: false, //TODO Check can update
      deliveryPartnerConfirmed: false, //TODO Check can update,
      rewardsIssued: 0, //TODO Check can update,
      sentToDeliveryPartner: false, //TODO Check can update,
      completedFlag: 'none', //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
      completedOrderFeedback: null, //TODO: Check can add feedback after order
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //TODO: Check using partial orders
      deliveryPartner: null, //TODO: Check can set after order creation when the courier is subsequently confirmed
      parentOrder: null,
    },
    {
      id: 2,
      items: [1, 6, 7],
      total: 2800,
      tipAmount: 100,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: 'accepted',
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2023-10-12 11:00:00',
      fulfilmentSlotTo: '2023-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: '',
      deliveryPartnerAccepted: false,
      deliveryPartnerConfirmed: false,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: 'none',
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      deliveryPartner: null,
      parentOrder: null,
    },
    {
      id: 3,
      items: [2, 3],
      total: 600,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      marketingOptIn: false,
      vendor: 1,
      restaurantAcceptanceStatus: 'rejected',
      customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2002-10-12 11:00:00',
      fulfilmentSlotTo: '2002-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: '',
      deliveryPartnerAccepted: false,
      deliveryPartnerConfirmed: false,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: 'none',
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      deliveryPartner: null,
      parentOrder: null,
    },
    {
      id: 4,
      items: [1, 2, 3, 6, 8],
      total: 3100,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2022-10-12 11:00:00',
      fulfilmentSlotTo: '2022-10-12 12:00:00',
      discount: 1,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: '',
      deliveryPartnerAccepted: false, //TODO Check can update
      deliveryPartnerConfirmed: false, //TODO Check can update,
      rewardsIssued: 0, //TODO Check can update,
      sentToDeliveryPartner: false, //TODO Check can update,
      completedFlag: 'none', //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
      completedOrderFeedback: null, //TODO: Check can add feedback after order
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //TODO: Check using partial orders
      deliveryPartner: null, //TODO: Check can set after order creation when the courier is subsequently confirmed
      parentOrder: 1,
    },
    {
      id: 5,
      items: [1, 6, 7],
      total: 2800,
      tipAmount: 100,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: 'accepted',
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2023-10-12 11:00:00',
      fulfilmentSlotTo: '2023-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: '',
      deliveryPartnerAccepted: false,
      deliveryPartnerConfirmed: false,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: 'none',
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      deliveryPartner: null,
      parentOrder: 2,
    },
    {
      id: 6,
      items: [1, 6, 7],
      total: 2800,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: 'accepted',
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0xb98AEa2159e4855c8C703A19f57912ACAdCa3625',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2023-10-12 11:00:00',
      fulfilmentSlotTo: '2023-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: 'random_delivery_id',
      deliveryPartnerAccepted: true,
      deliveryPartnerConfirmed: true,
      deliveryPartner: 1,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: 'none',
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      parentOrder: 2,
    },
    {
      id: 7,
      items: [1, 2],
      total: 600,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: 'accepted',
      marketingOptIn: false,
      vendor: 1,
      customerWalletAddress: '0xb98AEa2159e4855c8C703A19f57912ACAdCa3625',
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',

      fulfilmentMethod: 1,
      fulfilmentSlotFrom: '2023-10-12 11:00:00',
      fulfilmentSlotTo: '2023-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: 'random_delivery_id',
      deliveryPartnerAccepted: true,
      deliveryPartnerConfirmed: true,
      deliveryPartner: 1,
      completedFlag: 'completed',
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      parentOrder: 2,
    },
  ];
};
