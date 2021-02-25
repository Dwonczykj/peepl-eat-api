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

  '/': { action: 'view-homepage' },

  '/topup': {action: 'view-topup'},

  '/help': {action: 'view-help'},

  '/vendors': {action: 'vendors/view-all-vendors'},
  '/vendors/:vendorid': { action: 'vendors/view-vendor-menu' },
  'GET /vendors/download-image/:vendorid': { action: 'vendors/download-image' },

  'GET /help': { action: 'view-help' },

  'GET /orders/:orderId': { action: 'orders/view-order-confirmation' },
  'GET /orders': { action: 'orders/view-my-orders' },
  'GET /orders/all': { action: 'orders/view-all-orders' },

  'GET /api/v1/products/get-product-options/:productId': { action: 'products/get-product-options' },
  'POST /api/v1/products/get-product-delivery-methods': { action: 'products/get-product-delivery-methods' },

  'POST /api/v1/orders/create-order': { action: 'orders/create-order' },
  'POST /api/v1/orders/payment-submitted': { action: 'orders/payment-submitted' },

  // ADMIN
  'GET /admin/vendors': { action: 'admin/view-vendors' },
  'POST /api/v1/admin/create-vendor': { action: 'admin/create-vendor' },
  'GET /admin/vendors/:vendorid': { action: 'admin/view-edit-vendor' },
  'post /api/v1/admin/edit-vendor': { action: 'admin/edit-vendor' },

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
