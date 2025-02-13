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
  'admin/signup': true,
  'admin/signup-with-password': true,
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
  'admin/view-approve-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/approve-or-decline-order': true, //TODO: add 'is-logged-in' and 'is-vendor' poligices to this
  'admin/*': 'is-logged-in',
  'discounts/*': ['localize', 'firebase', 'firebase-auth', 'is-logged-in'],
  'orders/*': ['localize', 'firebase', 'firebase-auth', 'is-logged-in'],
  'products/*': ['localize', 'firebase', 'firebase-auth', 'is-logged-in'],
  'vendors/*': [
    'localize',
    'firebase',
    'firebase-auth',
    'is-logged-in',
    'is-vendor',
  ],
  'couriers/*': ['is-logged-in', 'is-delivery-partner'],
  '*': 'is-logged-in',
};
