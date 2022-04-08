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
  'admin/*': 'is-logged-in',
  'admin/view-login': true,
  'admin/login': true,
  'admin/view-create-vendor': 'is-super-admin',
  'admin/view-vendors': 'is-super-admin',
  'admin/create-vendor': 'is-super-admin',
  'admin/create-postal-district': 'is-super-admin',
  'admin/edit-postal-district': 'is-super-admin',
  'admin/view-postal-districts': 'is-super-admin',
  'admin/view-approve-order': true,
  'admin/approve-or-decline-order': true,
  '*': true,

};
