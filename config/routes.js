/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  // 'GET /': { action: 'view-homepage' },

  // POSTAL DISTRICTS
  'GET /api/v1/postal-districts/get-all-postal-districts': {
    action: 'postal-districts/get-all-postal-districts',
  },

  // VENDORS
  'GET /api/v1/vendors': { action: 'vendors/view-all-vendors' },
  'GET /api/v1/vendors/:vendorid': { action: 'vendors/view-vendor-menu' },
  'GET /api/v1/vendors/get-fulfilment-slots': {
    action: 'vendors/get-fulfilment-slots',
  },
  'GET /api/v1/vendors/get-next-fulfilment-slot': {
    action: 'vendors/get-next-fulfilment-slot',
  },
  'GET /api/v1/vendors/get-eligible-order-dates': {
    action: 'vendors/get-eligible-order-dates',
  },
  'GET /api/v1/vendors/get-postal-districts': {
    action: 'vendors/get-postal-districts',
  },

  // PRODUCT OPTIONS
  'GET /api/v1/products/get-product-options/:productId': {
    action: 'products/get-product-options',
  },

  // DISCOUNTS
  'GET /api/v1/discounts/check-discount-code/:discountCode': {
    action: 'discounts/check-discount-code',
  },

  // COURIERS
  'POST /api/v1/couriers/accept-reject-delivery-confirmation': {
    action: 'couriers/accept-reject-delivery-confirmation',
  },
  'POST /api/v1/couriers/add-delivery-availability-for-order': {
    action: 'couriers/add-delivery-availability-for-order',
  },
  'POST /api/v1/couriers/cancel-delivery': {
    action: 'couriers/cancel-delivery',
  },
  'ALL /couriers/deliveries': { action: 'couriers/view-deliveries' },

  // ORDERS
  'GET /api/v1/orders': { action: 'orders/view-my-orders' },
  'POST /api/v1/orders/create-order': { action: 'orders/create-order' },
  'GET /api/v1/orders/get-order-status': { action: 'orders/get-order-status' },
  'POST /api/v1/orders/peepl-pay-webhook': {
    action: 'orders/peepl-pay-webhook',
  },
  'POST /api/v1/orders/peepl-pay-update-paid-order-webhook': {
    action: 'orders/peepl-pay-update-paid-order-webhook',
  },
  'POST /api/v1/orders/peepl-pay-refund-webhook': {
    action: 'orders/peepl-pay-refund-webhook',
  },
  'GET /api/v1/orders/get-order-details': {
    action: 'orders/get-order-details',
  },
  'GET /api/v1/orders/ongoing-orders-by-wallet': {
    action: 'orders/ongoing-orders-by-wallet',
  },

  // ADMIN
  'GET /admin/login': { action: 'admin/view-login' },
  'GET /admin/login-with-password': {
    action: 'admin/view-login-with-password',
  },
  'GET /api/v1/admin/login': { action: 'admin/view-login' },
  'GET /api/v1/admin/logged-in': { action: 'admin/logged-in' },
  'GET /admin/signup': { action: 'admin/view-signup' },
  'GET /api/v1/admin/signup': { action: 'admin/view-signup' },

  'GET /admin/account': { action: 'admin/view-account' },

  // 'POST /admin/login': { action: 'admin/login' },
  // 'POST /api/v1/admin/login': { action: 'admin/login' },
  'POST /admin/signup': { action: 'admin/signup' },
  'POST /api/v1/admin/signup': { action: 'admin/signup' },
  'POST /api/v1/admin/signup-with-password': {
    action: 'admin/signup-with-password',
  },
  'POST /api/v1/admin/login-with-firebase': {
    action: 'admin/login-with-firebase',
  },
  'POST /api/v1/admin/login-with-secret': { action: 'admin/login-with-secret' },
  'POST /api/v1/admin/login-with-password': {
    action: 'admin/login-with-password',
  },
  'POST /api/v1/admin/user-exists-for-email': {
    action: 'admin/user-exists-for-email',
  },
  'POST /api/v1/admin/user-exists-for-phone': {
    action: 'admin/user-exists-for-phone',
  },

  'POST /api/v1/admin/update-user': { action: 'admin/update-user' },

  'GET /admin/logout': { action: 'admin/logout' },
  'ALL /api/v1/admin/logout': { action: 'admin/logout' },
  'POST /api/v1/admin/deregister-user': { action: 'admin/deregister-user' },

  'GET /admin': { action: 'admin/view-vendors' },
  'GET /admin/vendors': { action: 'admin/view-vendors' },
  'GET /admin/vendors/new': { action: 'admin/view-create-vendor' },
  'GET /admin/vendors/:vendorid': { action: 'admin/view-edit-vendor' },
  'GET /admin/orders': { action: 'admin/view-all-orders' },
  'GET /admin/discount-codes': { action: 'admin/view-discount-codes' },
  'GET /admin/approve-order/:orderId': { action: 'admin/view-approve-order' },
  'GET /admin/order/:orderId': { action: 'admin/view-order' },
  'GET /admin/postal-districts': { action: 'admin/view-postal-districts' },
  'GET /api/v1/admin/is-user-vendor-inventory-manager/:vendorId': {
    action: 'admin/is-user-vendor-inventory-manager',
  },
  'GET /api/v1/admin/is-user-vendor-sales-manager/:vendorId': {
    action: 'admin/is-user-vendor-sales-manager',
  },
  'GET /api/v1/admin/is-user-vendor-owner/:vendorId': {
    action: 'admin/is-user-vendor-owner',
  },
  'GET /api/v1/admin/is-user-vendor-admin/:vendorId': {
    action: 'admin/is-user-vendor-admin',
  },
  'POST /api/v1/admin/customer-cancel-order': {
    action: 'admin/customer-cancel-order',
  },
  'POST /api/v1/admin/customer-update-paid-order': {
    action: 'admin/customer-update-paid-order',
  },
  'POST /api/v1/admin/customer-received-order': {
    action: 'admin/customer-received-order',
  },
  'GET /admin/delivery-partners': { action: 'admin/view-delivery-partners' },
  'GET /admin/delivery-partners/:deliveryPartnerId': {
    action: 'admin/view-edit-delivery-partner',
  },
  'GET /admin/delivery-partners/new': {
    action: 'admin/view-create-delivery-partner',
  },
  'GET /admin/category-groups': { action: 'admin/view-category-groups' },
  'GET /admin/category-groups/:categoryGroupId': {
    action: 'admin/view-edit-category-group',
  },
  'GET /admin/category-groups/new': {
    action: 'admin/view-create-category-group',
  },

  'POST /api/v1/admin/create-vendor': { action: 'admin/create-vendor' },
  'POST /api/v1/admin/edit-vendor': { action: 'admin/edit-vendor' },
  'POST /api/v1/admin/create-delivery-partner': {
    action: 'admin/create-delivery-partner',
  },
  'POST /api/v1/admin/edit-delivery-partner': {
    action: 'admin/edit-delivery-partner',
  },
  'POST /api/v1/admin/edit-product': { action: 'admin/edit-product' },
  'POST /api/v1/admin/create-product': { action: 'admin/create-product' },
  'POST /api/v1/admin/discontinue-product': {
    action: 'admin/discontinue-product',
  },
  'POST /api/v1/admin/update-user-vendor-role': {
    action: 'admin/update-user-vendor-role',
  },
  'POST /api/v1/admin/create-product-option': {
    action: 'admin/create-product-option',
  },
  'POST /api/v1/admin/edit-product-option': {
    action: 'admin/edit-product-option',
  },
  'POST /api/v1/admin/create-category-group': {
    action: 'admin/create-category-group',
  },
  'POST /api/v1/admin/edit-category-group': {
    action: 'admin/edit-category-group',
  },
  'POST /api/v1/admin/create-product-option-value': {
    action: 'admin/create-product-option-value',
  },
  'POST /api/v1/admin/edit-product-option-value': {
    action: 'admin/edit-product-option-value',
  },
  'POST /api/v1/admin/archive-order': { action: 'admin/archive-order' },
  'POST /api/v1/admin/update-product-status': {
    action: 'admin/update-product-status',
  },
  'POST /api/v1/admin/create-discount': { action: 'admin/create-discount' },
  'POST /api/v1/admin/edit-discount': { action: 'admin/edit-discount' },
  'POST /api/v1/admin/create-update-openinghours': {
    action: 'admin/create-update-openinghours',
  },
  'POST /api/v1/admin/update-fulfilment-method': {
    action: 'admin/update-fulfilment-method',
  },
  'POST /api/v1/admin/approve-or-decline-order': {
    action: 'admin/approve-or-decline-order',
  },
  'POST /api/v1/admin/create-postal-district': {
    action: 'admin/create-postal-district',
  },
  'POST /api/v1/admin/edit-postal-district': {
    action: 'admin/edit-postal-district',
  },
  'POST /api/v1/admin/edit-vendor-postal-districts': {
    action: 'admin/edit-vendor-postal-districts',
  },
};
