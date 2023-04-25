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
  'home/view-dashboard': ['is-logged-in'],
  'home/view-nearest-vendors': true,
  'admin/view-login': true,
  'admin/login-with-firebase': true,
  'admin/view-login-with-password': true,
  'admin/login-with-secret': true,
  'admin/login-with-password': true,
  'admin/login': true,
  'admin/logout': true,
  'admin/logged-in': true,
  'admin/view-account': [
    'localize',
    'firebase',
    'firebase-auth',
    'is-logged-in',
  ],
  'admin/user-exists-for-email': true,
  'admin/user-exists-for-phone': true,
  'admin/get-user-for-wallet-address': true,
  'admin/account-is-vendor': true,
  'admin/signup': true,
  'admin/get-survey-questions': true,
  'admin/submit-survey-response': true,
  'admin/register-email-to-waiting-list': true,
  'admin/send-sms': 'is-super-admin', // ! only super-admins
  'admin/signup-with-password': ['firebase'],
  'admin/view-signup': true,
  'admin/view-create-vendor': 'is-super-admin',
  'admin/view-vendors': 'is-super-admin',
  'admin/create-vendor': 'is-super-admin',
  'admin/create-delivery-partner': 'is-super-admin',
  'admin/edit-delivery-partner': 'is-super-admin',
  'admin/view-edit-delivery-partner': 'is-super-admin',
  'admin/view-create-delivery-partner': 'is-super-admin',
  'admin/create-postal-district': 'is-super-admin',
  'admin/edit-postal-district': 'is-super-admin',
  'admin/view-postal-districts': 'is-super-admin',
  'admin/update-stock-count': ['is-logged-in'],
  'admin/view-approve-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/approve-or-decline-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-update-paid-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-cancel-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/customer-received-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/bulk-update-data': ['is-super-admin'],
  'admin/*': 'is-logged-in',
  'orders/*': true, // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'payments/create-stripe-payment-intent': true,
  'payments/check-stripe-payment-intent': true,
  'payments/stripe-event-webhook': true,
  'payments/*': 'is-logged-in',
  'home/redirect-to-app-store': true,
  'home/like': true,
  'home/*': 'is-logged-in',
  'discounts/*': true, // ['localize', 'firebase', 'firebase-auth', 'is-logged-in'],
  'products/upload-product-suggestion': true, // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'products/update-product-rating': ['is-logged-in', 'is-vegi-service'], // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'products/*': true, // ["localize", "firebase", "firebase-auth", "is-logged-in"],
  'vendors/*': true /*[    "localize",
    "firebase",
    "firebase-auth",
    "is-logged-in",
    "is-vendor",
  ],*/,
  'couriers/*': true, // ["is-logged-in", "is-delivery-partner"],
  '*': true, // "is-logged-in",
};
