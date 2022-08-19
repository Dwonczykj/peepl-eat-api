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
  'GET /api/v1/postal-districts/get-all-postal-districts': { action: 'postal-districts/get-all-postal-districts' },

  // VENDORS
  'GET /api/v1/vendors': {action: 'vendors/view-all-vendors'},
  'GET /api/v1/vendors/:vendorid': { action: 'vendors/view-vendor-menu' },
  'GET /api/v1/vendors/get-fulfilment-slots': { action: 'vendors/get-fulfilment-slots' },
  'GET /api/v1/vendors/get-postal-districts': { action: 'vendors/get-postal-districts' },

  // PRODUCT OPTIONS
  'GET /api/v1/products/get-product-options/:productId': { action: 'products/get-product-options' },

  // DISCOUNTS
  'GET /api/v1/discounts/check-discount-code/:discountCode': { action: 'discounts/check-discount-code' },

  // COURIERS
  'POST /api/v1/couriers/accept-reject-delivery-confirmation': { action: 'couriers/accept-reject-delivery-confirmation' },
  'POST /api/v1/couriers/add-delivery-availability-for-order': { action: 'couriers/add-delivery-availability-for-order' },
  'POST /api/v1/couriers/cancel-delivery': { action: 'couriers/cancel-delivery' },
  'ALL /couriers/deliveries': { action: 'couriers/view-deliveries' },

  // ORDERS
  'GET /api/v1/orders': { action: 'orders/view-my-orders' },
  'POST /api/v1/orders/create-order': { action: 'orders/create-order' },
  'GET /api/v1/orders/get-order-status': { action: 'orders/get-order-status' },
  'POST /api/v1/orders/peepl-pay-webhook': { action: 'orders/peepl-pay-webhook' },
  'GET /api/v1/orders/get-order-details': { action: 'orders/get-order-details' },

  // ADMIN
  'GET /admin/login': { action: 'admin/view-login' },
  'GET /admin/account': { action: 'admin/view-account' },
  // 'POST /admin/login': { action: 'admin/login' },
  'GET /api/v1/admin/login': { action: 'admin/view-login' },
  // 'POST /api/v1/admin/login': { action: 'admin/login' },
  'POST /api/v1/admin/login-with-firebase': { action: 'admin/login-with-firebase' },

  'POST /api/v1/admin/signup': { action: 'admin/signup' },
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
  'GET /admin/postal-districts': { action: 'admin/view-postal-districts' },
  'GET /api/v1/admin/is-user-vendor-inventory-manager/:vendorId': { action: 'admin/is-user-vendor-inventory-manager' },
  'GET /api/v1/admin/is-user-vendor-sales-manager/:vendorId': { action: 'admin/is-user-vendor-sales-manager' },
  'GET /api/v1/admin/is-user-vendor-owner/:vendorId': { action: 'admin/is-user-vendor-owner' },
  'GET /api/v1/admin/is-user-vendor-admin/:vendorId': { action: 'admin/is-user-vendor-admin' },

  'POST /api/v1/admin/create-vendor': { action: 'admin/create-vendor' },
  'POST /api/v1/admin/edit-vendor': { action: 'admin/edit-vendor' },
  'POST /api/v1/admin/edit-product': { action: 'admin/edit-product' },
  'POST /api/v1/admin/create-product': { action: 'admin/create-product' },
  'POST /api/v1/admin/discontinue-product': { action: 'admin/discontinue-product' },
  'POST /api/v1/admin/update-user-vendor-role': { action: 'admin/update-user-vendor-role' },
  'POST /api/v1/admin/create-product-option': { action: 'admin/create-product-option' },
  'POST /api/v1/admin/edit-product-option': { action: 'admin/edit-product-option' },
  'POST /api/v1/admin/create-product-option-value': { action: 'admin/create-product-option-value' },
  'POST /api/v1/admin/edit-product-option-value': { action: 'admin/edit-product-option-value' },
  'POST /api/v1/admin/archive-order': { action: 'admin/archive-order' },
  'POST /api/v1/admin/update-product-status': { action: 'admin/update-product-status' },
  'POST /api/v1/admin/create-discount': { action: 'admin/create-discount' },
  'POST /api/v1/admin/edit-discount': { action: 'admin/edit-discount' },
  'POST /api/v1/admin/create-update-openinghours': { action: 'admin/update-openinghours'},
  'POST /api/v1/admin/approve-or-decline-order': { action: 'admin/approve-or-decline-order' },
  'POST /api/v1/admin/create-postal-district': { action: 'admin/create-postal-district' },
  'POST /api/v1/admin/edit-postal-district': { action: 'admin/edit-postal-district' },
  'POST /api/v1/admin/edit-vendor-postal-districts': { action: 'admin/edit-vendor-postal-districts' },

};
