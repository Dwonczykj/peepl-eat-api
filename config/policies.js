/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/
  'home/view-dashboard': ['is-logged-in', 'log-call'],
  'home/view-nearest-vendors': ['log-call'],
  'admin/view-login': ['log-call'],
  'admin/login-with-firebase': ['log-call'],
  'admin/view-login-with-password': ['log-call'],
  'admin/login-with-secret': ['log-call'],
  'admin/login-with-password': ['log-call'],
  'admin/login': ['log-call'],
  'admin/logout': ['log-call'],
  'admin/reset-password': ['log-call'],
  'admin/logged-in': ['log-call'],
  'admin/view-account': [
    'localize',
    'firebase',
    'firebase-auth',
    'is-logged-in',
  ],
  'admin/user-exists-for-email': ['log-call'],
  'admin/user-exists-for-phone': ['log-call'],
  'admin/get-user-for-wallet-address': ['log-call'],
  'admin/account-is-vendor': ['log-call'],
  'admin/signup': ['log-call'],
  'admin/get-survey-questions': ['log-call'],
  'admin/submit-survey-response': ['log-call'],
  'admin/register-email-to-waiting-list': ['log-call'],
  'admin/update-waiting-list-entry': ['is-logged-in', 'log-call'],
  'admin/subscribe-waitlist-email-notifications': ['log-call'],
  'admin/get-position-in-waitinglist': ['log-call'],
  'admin/generate-voucher-code': ['is-super-admin', 'log-call'],
  'admin/validate-discount-code': ['is-super-admin', 'log-call'],
  'admin/send-sms': ['is-super-admin', 'log-call'], // ! only super-admins
  'admin/signup-with-password': ['firebase', 'log-call'],
  'admin/view-signup': ['log-call'],
  'admin/view-create-vendor': ['is-super-admin', 'log-call'],
  'admin/view-vendors': ['is-super-admin', 'log-call'],
  'admin/create-vendor': ['is-super-admin', 'log-call'],
  'admin/create-delivery-partner': ['is-super-admin', 'log-call'],
  'admin/edit-delivery-partner': ['is-super-admin', 'log-call'],
  'admin/view-edit-delivery-partner': ['is-super-admin', 'log-call'],
  'admin/view-create-delivery-partner': ['is-super-admin', 'log-call'],
  'admin/create-postal-district': ['is-super-admin', 'log-call'],
  'admin/edit-postal-district': ['is-super-admin', 'log-call'],
  'admin/view-postal-districts': ['is-super-admin', 'log-call'],
  'admin/update-stock-count': ['is-logged-in', 'log-call'],
  'admin/view-approve-order': ['log-call'], //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/approve-or-decline-order': ['log-call'], //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-update-paid-order': ['log-call'], //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-cancel-order': ['log-call'], //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-received-order': ['log-call'], //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/bulk-update-data': ['is-super-admin', 'log-call'],
  'admin/*': ['is-logged-in', 'log-call'],
  'orders/*': ['log-call'], // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'payments/create-stripe-payment-intent': ['log-call'],
  'payments/check-stripe-payment-intent': ['log-call'],
  'payments/stripe-event-webhook': ['log-call'],
  'payments/*': ['is-logged-in', 'log-call'],
  'home/redirect-to-app-store': ['log-call'],
  'home/like': ['log-call'],
  'home/*': ['is-logged-in', 'log-call'],
  'discounts/*': ['log-call'], // ['localize', 'firebase', 'firebase-auth', 'is-logged-in'],
  'products/upload-product-suggestion': ['log-call'], // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'products/update-product-rating': [
    'is-logged-in',
    'is-vegi-service',
    'log-call',
  ], // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'products/*': ['log-call'], // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'vendors/*': ['log-call'] /*[    "localize",
    "firebase",
    "firebase-auth",
    "is-logged-in",
    "is-vendor",
  ],*/,
  'users/*': ['is-logged-in', 'log-call'],
  'couriers/*': ['log-call'], // ["is-logged-in", "is-delivery-partner"],
  '*': ['log-call'], // "is-logged-in",
};
