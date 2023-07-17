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
  'GET /api/v1/vendors/product-categories': {
    action: 'vendors/view-product-categories',
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
  'GET /api/v1/products/get-product-by-qrcode': {
    action: 'products/get-product-by-qrcode',
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
  'GET /api/v1/orders/ongoing-orders-by-wallet': {
    action: 'orders/ongoing-orders-by-wallet',
  },
  'POST /api/v1/orders/create-order': { action: 'orders/create-order' },
  'POST /api/v1/orders/cancel-order': { action: 'orders/cancel-order' },
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
  'POST /admin/reset-password': { action: 'admin/reset-password' },
  'POST /api/v1/admin/reset-password': { action: 'admin/reset-password' },
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

  'POST /api/v1/payments/create-stripe-payment-intent': {
    action: 'payments/create-stripe-payment-intent',
  },
  'POST /api/v1/payment_intents': {
    action: 'payments/create-stripe-payment-intent',
  },
  'POST /api/v1/refunds': {
    action: 'admin/login', // todo: Create a route
  },
  'POST /api/v1/revert_reward_issue': {
    action: 'admin/login', // todo: Create a route
  },
  'POST /api/v1/reward/issue-reward': {
    action: 'admin/login', // todo: Create a route
  },

  'GET /api/v1/payments/check-stripe-payment-intent/:paymentIntentId': {
    action: 'payments/check-stripe-payment-intent',
  },
  'GET /api/v1/payment_intents/:paymentIntentId': {
    action: 'payments/check-stripe-payment-intent',
  },
  'POST /api/v1/admin/create-stripe-account': {
    action: 'admin/create-stripe-account',
  },
  'GET /api/v1/admin/get-stripe-accounts': {
    action: 'admin/get-stripe-accounts',
  },
  'POST /api/v1/admin/update-stripe-account': {
    action: 'admin/update-stripe-account',
  },
  'GET /api/v1/payments/get-stripe-account/:stripeCustomerId': {
    action: 'payments/get-stripe-account',
  },

  'POST /api/v1/payments/stripe-event-webhook': {
    action: 'payments/stripe-event-webhook',
  },
  'POST /api/v1/payments/fuse-event-webhook': {
    action: 'payments/fuse-event-webhook',
  },

  'POST /api/v1/admin/update-user': { action: 'admin/update-user' },

  'GET /admin/logout': { action: 'admin/logout' },
  'ALL /api/v1/admin/logout': { action: 'admin/logout' },
  'POST /api/v1/admin/deregister-user': { action: 'admin/deregister-user' },

  'ALL /': { action: 'home/view-dashboard' },
  'GET /home': { action: 'home/view-dashboard' },
  'GET /api/v1/home/nearest-vendors': { action: 'home/view-nearest-vendors' },
  'GET /home/like': { action: 'home/like' },
  'POST /api/v1/home/like': { action: 'home/like' },

  'GET /admin/product-suggestions': {
    action: 'admin/view-product-suggestions',
  },
  'GET /admin/product-suggestions/:productSuggestionId': {
    action: 'admin/view-product-suggestion',
  },
  'POST /api/v1/products/upload-product-suggestion': {
    action: 'products/upload-product-suggestion',
  },
  'POST /api/v1/admin/create-product-suggestion': {
    action: 'products/upload-product-suggestion',
  },
  'POST /api/v1/admin/edit-product-suggestion': {
    action: 'admin/edit-product-suggestion',
  },
  'POST /api/v1/products/upload-product-suggestion-image': {
    action: 'products/upload-product-suggestion-image',
  },

  'GET /home/redirect-to-app-store': { action: 'home/redirect-to-app-store' },
  'GET /admin': { action: 'admin/view-vendors' },
  'GET /admin/vendors': { action: 'admin/view-vendors' },
  'GET /admin/vendors/new': { action: 'admin/view-create-vendor' },
  'GET /admin/vendors/:vendorid': { action: 'admin/view-edit-vendor' },
  'GET /admin/upload-products': { action: 'admin/view-upload-products' },
  'POST /api/v1/admin/upload-products': { action: 'admin/upload-products' },
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
  'GET /api/v1/admin/user-for-wallet-address': {
    action: 'admin/get-user-for-wallet-address',
  },
  'GET /api/v1/admin/user-details': {
    action: 'admin/get-user-details',
  },
  'GET /admin/white-list': {
    action: 'admin/view-white-list',
  },
  'POST /api/v1/admin/verify-wallet-account': {
    action: 'admin/verify-wallet-account',
  },
  'GET /admin/waiting-list': {
    action: 'admin/view-waiting-list',
  },
  'POST /api/v1/admin/onboard-user-email-from-waiting-list': {
    action: 'admin/onboard-user-email-from-waiting-list',
  },
  'GET /api/v1/admin/get-position-in-waitinglist': {
    action: 'admin/get-position-in-waitinglist',
  },

  'GET /api/v1/admin/account-is-vendor': {
    action: 'admin/account-is-vendor',
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
  'POST /api/v1/admin/create-product-category': {
    action: 'admin/create-product-category',
  },
  'POST /api/v1/admin/edit-product-category': {
    action: 'admin/edit-product-category',
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
  // 'POST /api/v1/admin/archive-order': { action: 'admin/archive-order' },
  'POST /api/v1/admin/update-product-status': {
    action: 'admin/update-product-status',
  },
  'POST /api/v1/admin/create-discount': { action: 'admin/create-discount' },
  'POST /api/v1/admin/edit-discount': { action: 'admin/edit-discount' },
  'POST /api/v1/admin/generate-voucher-code': {
    action: 'admin/generate-voucher-code',
  },
  'POST /api/v1/admin/validate-discount-code': {
    action: 'admin/validate-discount-code',
  },
  // 'POST /api/v1/admin/create-update-openinghours': {
  //   action: 'admin/create-update-openinghours',
  // },
  'POST /api/v1/admin/update-fulfilment-method': {
    action: 'admin/update-fulfilment-method',
  },
  'POST /api/v1/admin/approve-or-decline-order': {
    action: 'admin/approve-or-decline-order',
  },
  'POST /api/v1/admin/register-email-to-waiting-list': {
    action: 'admin/register-email-to-waiting-list',
  },
  'POST /api/v1/admin/update-waiting-list-entry': {
    action: 'admin/update-waiting-list-entry',
  },
  'POST /api/v1/admin/subscribe-waitlist-email-notifications': {
    action: 'admin/subscribe-waitlist-email-notifications',
  },
  'POST /api/v1/users/upload-user-avatar': {
    action: 'users/upload-user-avatar',
  },
  'POST /api/v1/users/update-user-self': {
    action: 'users/update-user-self',
  },
  'POST /api/v1/users/set-random-avatar': {
    action: 'users/set-random-avatar',
  },
  'POST /api/v1/admin/send-sms': {
    action: 'admin/send-sms',
  },
  'GET /api/v1/admin/get-survey-questions': {
    action: 'admin/get-survey-questions',
  },
  'POST /api/v1/admin/submit-survey-response': {
    action: 'admin/submit-survey-response',
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

  'POST /api/v1/admin/bulk-update-data': {
    action: 'admin/bulk-update-data',
  },
  'GET /admin/bulk-update-data': {
    action: 'admin/view-bulk-update-data',
  },

  'POST /api/v1/admin/update-stock-count': {
    action: 'admin/update-stock-count',
  },

  'GET /api/v1/products/get-product-rating': {
    action: 'products/get-product-rating',
  },
  'GET /api/v1/products/get-esc-sources': {
    action: 'products/get-esc-sources',
  },
  // 'POST /api/v1/admin/update-esc-rating': {
  //   action: 'admin/update-esc-rating',
  // },
  'POST /api/v1/admin/update-esc-source': {
    action: 'admin/update-esc-source',
  },
  // 'POST /api/v1/admin/update-esc-explanation': {
  //   action: 'admin/update-esc-explanation',
  // },
};
