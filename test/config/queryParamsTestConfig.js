module.exports = {
  // POSTAL DISTRICTS
  "GET /api/v1/postal-districts/get-all-postal-districts": {
    params: "postal-districts/get-all-postal-districts",
  },

  // VENDORS
  "GET /api/v1/vendors": { params: "vendors/view-all-vendors" },
  "GET /api/v1/vendors/:vendorid": { params: "vendors/view-vendor-menu" },
  "GET /api/v1/vendors/get-fulfilment-slots": {
    params: "vendors/get-fulfilment-slots",
  },
  "GET /api/v1/vendors/get-eligible-order-dates": {
    params: "vendors/get-eligible-order-dates",
  },
  "GET /api/v1/vendors/get-postal-districts": {
    params: "vendors/get-postal-districts",
  },

  // PRODUCT OPTIONS
  "GET /api/v1/products/get-product-options/:productId": {
    params: "products/get-product-options",
  },

  // DISCOUNTS
  "GET /api/v1/discounts/check-discount-code/:discountCode": {
    params: "discounts/check-discount-code",
  },

  // COURIERS
  // "POST /api/v1/couriers/accept-reject-delivery-confirmation": {
  //   params: "couriers/accept-reject-delivery-confirmation",
  // },
  // "POST /api/v1/couriers/add-delivery-availability-for-order": {
  //   params: "couriers/add-delivery-availability-for-order",
  // },
  // "POST /api/v1/couriers/cancel-delivery": {
  //   params: "couriers/cancel-delivery",
  // },
  "ALL /couriers/deliveries": { params: "couriers/view-deliveries" },

  // ORDERS
  "GET /api/v1/orders": { params: "orders/view-my-orders" },
  "POST /api/v1/orders/create-order": { params: "orders/create-order" },
  "GET /api/v1/orders/get-order-status": { params: "orders/get-order-status" },
  // "POST /api/v1/orders/peepl-pay-webhook": {
  //   params: "orders/peepl-pay-webhook",
  // },
  "GET /api/v1/orders/get-order-details": {
    params: "orders/get-order-details",
  },

  // ADMIN
  "GET /admin/login": { params: "admin/view-login" },
  "GET /admin/login-with-password": {
    params: "admin/view-login-with-password",
  },
  "GET /api/v1/admin/login": { params: "admin/view-login" },
  "GET /api/v1/admin/logged-in": { params: "admin/logged-in" },
  "GET /admin/signup": { params: "admin/view-signup" },
  "GET /api/v1/admin/signup": { params: "admin/view-signup" },

  "GET /admin/account": { params: "admin/view-account" },

  // 'POST /admin/login': { params: 'admin/login' },
  // 'POST /api/v1/admin/login': { params: 'admin/login' },
  // "POST /admin/signup": { params: "admin/signup" },
  // "POST /api/v1/admin/signup": { params: "admin/signup" },
  // "POST /api/v1/admin/signup-with-password": {
  //   params: "admin/signup-with-password",
  // },
  // "POST /api/v1/admin/login-with-firebase": {
  //   params: "admin/login-with-firebase",
  // },
  // "POST /api/v1/admin/login-with-secret": { params: "admin/login-with-secret" },
  // "POST /api/v1/admin/login-with-password": {
  //   params: "admin/login-with-password",
  // },
  // "POST /api/v1/admin/user-exists-for-email": {
  //   params: "admin/user-exists-for-email",
  // },
  // "POST /api/v1/admin/user-exists-for-phone": {
  //   params: "admin/user-exists-for-phone",
  // },

  // "POST /api/v1/admin/update-user": { params: "admin/update-user" },

  "GET /admin/logout": { params: "admin/logout" },
  "ALL /api/v1/admin/logout": { params: "admin/logout" },
  // "POST /api/v1/admin/deregister-user": { params: "admin/deregister-user" },

  "GET /admin": { params: "admin/view-vendors" },
  "GET /admin/vendors": { params: "admin/view-vendors" },
  "GET /admin/vendors/new": { params: "admin/view-create-vendor" },
  "GET /admin/vendors/:vendorid": { params: "admin/view-edit-vendor" },
  "GET /admin/orders": { params: "admin/view-all-orders" },
  "GET /admin/discount-codes": { params: "admin/view-discount-codes" },
  "GET /admin/approve-order/:orderId": { params: "admin/view-approve-order" },
  "GET /admin/order/:orderId": { params: "admin/view-order" },
  "GET /admin/postal-districts": { params: "admin/view-postal-districts" },
  "GET /api/v1/admin/is-user-vendor-inventory-manager/:vendorId": {
    params: "admin/is-user-vendor-inventory-manager",
  },
  "GET /api/v1/admin/is-user-vendor-sales-manager/:vendorId": {
    params: "admin/is-user-vendor-sales-manager",
  },
  "GET /api/v1/admin/is-user-vendor-owner/:vendorId": {
    params: "admin/is-user-vendor-owner",
  },
  "GET /api/v1/admin/is-user-vendor-admin/:vendorId": {
    params: "admin/is-user-vendor-admin",
  },
  "POST /api/v1/admin/customer-cancel-order": {
    params: "admin/customer-cancel-order",
  },
  "POST /api/v1/admin/customer-update-paid-order": {
    params: "admin/customer-update-paid-order",
  },
  "POST /api/v1/admin/customer-received-order": {
    params: "admin/customer-received-order",
  },
  "GET /admin/delivery-partners": { params: "admin/view-delivery-partners" },
  "GET /admin/delivery-partners/:deliveryPartnerId": {
    params: "admin/view-edit-delivery-partner",
  },
  "GET /admin/delivery-partners/new": {
    params: "admin/view-create-delivery-partner",
  },
  "GET /admin/category-groups": { params: "admin/view-category-groups" },
  "GET /admin/category-groups/:categoryGroupId": {
    params: "admin/view-edit-category-group",
  },
  "GET /admin/category-groups/new": {
    params: "admin/view-create-category-group",
  },
};