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
  '/barmenu': {action: 'view-bar-menu'},
  '/today': {action: 'view-today'},
  '/topup': {action: 'view-topup'},
  '/bar-menu': {action: 'view-topup'},
  '/help': {action: 'view-help'},
  '/vendors': {action: 'vendors/view-all-vendors'},
  '/vendors/:vendorid': { action: 'vendors/view-vendor-menu' },
  'GET /help': { action: 'view-help' },

  'GET /api/v1/products/get-product-options/:productId': { action: 'products/get-product-options' },
  'POST /api/v1/products/get-product-delivery-methods': { action: 'products/get-product-delivery-methods' },
  'POST /api/v1/bar/create-order': { action: 'bar/create-order' },
  'POST /api/v1/orders/create-order': { action: 'orders/create-order' },
  'POST /api/v1/orders/payment-submitted': { action: 'orders/payment-submitted' },


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
