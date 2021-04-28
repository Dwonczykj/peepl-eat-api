/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: {"downloadImage":{"verb":"GET","url":"/vendors/download-image/:vendorid","args":["vendorid"]},"getProductOptions":{"verb":"GET","url":"/api/v1/products/get-product-options/:productId","args":["productId"]},"subscribeToOrder":{"verb":"GET","url":"/api/v1/orders/subscribe-to-order/:orderId","args":["orderId"]},"getProductDeliveryMethods":{"verb":"POST","url":"/api/v1/products/get-product-delivery-methods","args":["productids"]},"createOrder":{"verb":"POST","url":"/api/v1/orders/create-order","args":["items","address","total"]},"paymentSubmitted":{"verb":"POST","url":"/api/v1/orders/payment-submitted","args":["orderId","jobId"]},"createVendor":{"verb":"POST","url":"/api/v1/admin/create-vendor","args":["name","description","type","image","walletId"]},"editVendor":{"verb":"POST","url":"/api/v1/admin/edit-vendor","args":["vendor","products"]},"requestPayout":{"verb":"POST","url":"/api/v1/admin/request-payout","args":[]}}
  /* eslint-enable */

});
