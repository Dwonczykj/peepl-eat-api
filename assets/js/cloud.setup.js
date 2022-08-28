/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({
  /* eslint-disable */

  methods: {
    getAllPostalDistricts: {
      verb: "GET",
      url: "/api/v1/postal-districts/get-all-postal-districts",
      args: [],
    },
    getFulfilmentSlots: {
      verb: "GET",
      url: "/api/v1/vendors/get-fulfilment-slots",
      args: ["vendor", "date"],
    },
    getEligibleOrderDates: {
      verb: "GET",
      url: "/api/v1/vendors/get-eligible-order-dates",
      args: ["vendor"],
    },
    getPostalDistricts: {
      verb: "GET",
      url: "/api/v1/vendors/get-postal-districts",
      args: ["vendor"],
    },
    getProductOptions: {
      verb: "GET",
      url: "/api/v1/products/get-product-options/:productId",
      args: ["productId"],
    },
    checkDiscountCode: {
      verb: "GET",
      url: "/api/v1/discounts/check-discount-code/:discountCode",
      args: ["discountCode", "vendorId"],
    },
    createOrder: {
      verb: "POST",
      url: "/api/v1/orders/create-order",
      args: [
        "items",
        "address",
        "total",
        "marketingOptIn",
        "discountCode",
        "vendor",
        "fulfilmentMethod",
        "fulfilmentSlotFrom",
        "fulfilmentSlotTo",
        "tipAmount",
        "walletAddress",
      ],
    },
    getOrderStatus: {
      verb: "GET",
      url: "/api/v1/orders/get-order-status",
      args: ["orderId"],
    },
    peeplPayWebhook: {
      verb: "POST",
      url: "/api/v1/orders/peepl-pay-webhook",
      args: ["publicId", "status"],
    },
    getOrderDetails: {
      verb: "GET",
      url: "/api/v1/orders/get-order-details",
      args: ["orderId"],
    },
    acceptRejectDeliveryConfirmation: {
      verb: "POST",
      url: "/api/v1/couriers/accept-reject-delivery-confirmation",
      args: ["deliveryId", "courierConfirmed"],
    },
    addDeliveryAvailabilityForOrder: {
      verb: "POST",
      url: "/api/v1/couriers/add-delivery-availability-for-order",
      args: ["vegiOrderId", "deliveryId", "courierAccepted"],
    },
    cancelDelivery: {
      verb: "POST",
      url: "/api/v1/couriers/cancel-delivery",
      args: ["vegiOrderId", "deliveryId"],
    },
    signup: {
      verb: "POST",
      url: "/api/v1/admin/signup",
      args: [
        "emailAddress",
        "phoneNoCountry",
        "phoneCountryCode",
        "name",
        "vendorId",
        "courierId",
        "role",
        "vendorRole",
        "courierRole",
      ],
    },
    // login: {
    //   verb: "POST",
    //   url: "/api/v1/admin/login",
    //   args: ["emailAddress", "password", "rememberMe"],
    // },
    userExistsForEmail: {
      verb: "POST",
      url: "/api/v1/admin/user-exists-for-email",
      args: ["email"],
    },
    logout: { verb: "GET", url: "/admin/logout", args: [] },
    userExistsForPhone: {
      verb: "POST",
      url: "/api/v1/admin/user-exists-for-phone",
      args: ["countryCodeNoFormat", "phoneNoCountryNoFormat"],
    },
    loginWithFirebase: {
      verb: "POST",
      url: "/api/v1/admin/login-with-firebase",
      args: ["phoneNumber", "firebaseSessionToken"],
    }, // NOTE: Manually added as sails run rebuild-cloud-sdk fails with typescript files where any variable contains an annotation or declare
    createVendor: {
      verb: "POST",
      url: "/api/v1/admin/create-vendor",
      args: [
        "name",
        "description",
        "type",
        "image",
        "walletAddress",
        "phoneNumber",
        "deliveryRestrictionDetails",
        "status",
        "costLevel",
        "rating",
        "isVegan",
      ],
    },
    editVendor: {
      verb: "POST",
      url: "/api/v1/admin/edit-vendor",
      args: [
        "id",
        "name",
        "description",
        "image",
        "walletAddress",
        "phoneNumber",
        "deliveryRestrictionDetails",
        "status",
        "costLevel",
        "rating",
        "isVegan",
        "minimumOrderAmount",
      ],
    },
    editProduct: {
      verb: "POST",
      url: "/api/v1/admin/edit-product",
      args: [
        "id",
        "name",
        "description",
        "basePrice",
        "image",
        "isAvailable",
        "priority",
        "isFeatured",
      ],
    },
    createProduct: {
      verb: "POST",
      url: "/api/v1/admin/create-product",
      args: [
        "name",
        "description",
        "basePrice",
        "image",
        "isAvailable",
        "priority",
        "isFeatured",
        "vendor",
      ],
    },
    createProductOption: {
      verb: "POST",
      url: "/api/v1/admin/create-product-option",
      args: ["name", "product"],
    },
    editProductOption: {
      verb: "POST",
      url: "/api/v1/admin/edit-product-option",
      args: ["id", "name"],
    },
    createProductOptionValue: {
      verb: "POST",
      url: "/api/v1/admin/create-product-option-value",
      args: [
        "name",
        "description",
        "priceModifier",
        "isAvailable",
        "productOption",
      ],
    },
    editProductOptionValue: {
      verb: "POST",
      url: "/api/v1/admin/edit-product-option-value",
      args: ["id", "name", "description", "priceModifier", "isAvailable"],
    },
    archiveOrder: {
      verb: "POST",
      url: "/api/v1/admin/archive-order",
      args: ["orderId"],
    },
    updateProductStatus: {
      verb: "POST",
      url: "/api/v1/admin/update-product-status",
      args: ["productIds", "isAvailable"],
    },
    createDiscount: {
      verb: "POST",
      url: "/api/v1/admin/create-discount",
      args: ["code", "percentage", "expiryDateTime", "maxUses", "isEnabled"],
    },
    editDiscount: {
      verb: "POST",
      url: "/api/v1/admin/edit-discount",
      args: [
        "id",
        "code",
        "percentage",
        "expiryDateTime",
        "maxUses",
        "isEnabled",
      ],
    },
    updateOpeninghours: {
      verb: "POST",
      url: "/api/v1/admin/create-update-openinghours",
      args: ["openingHours"],
    },
    approveOrDeclineOrder: {
      verb: "POST",
      url: "/api/v1/admin/approve-or-decline-order",
      args: ["orderId", "restaurantAccepted"],
    },
    createPostalDistrict: {
      verb: "POST",
      url: "/api/v1/admin/create-postal-district",
      args: ["outcode"],
    },
    editPostalDistrict: {
      verb: "POST",
      url: "/api/v1/admin/edit-postal-district",
      args: ["id", "outcode"],
    },
    editVendorPostalDistricts: {
      verb: "POST",
      url: "/api/v1/admin/edit-vendor-postal-districts",
      args: ["districts", "vendorId"],
    },
  },
  /* eslint-enable */
});
