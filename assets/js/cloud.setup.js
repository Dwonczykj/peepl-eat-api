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
  methods: {"getProductOptions":{"verb":"GET","url":"/api/v1/products/get-product-options/:productId","args":["productId"]},"getProductDeliveryMethods":{"verb":"POST","url":"/api/v1/products/get-product-delivery-methods","args":["productids"]},"createOrder":{"verb":"POST","url":"/api/v1/bar/create-order","args":["products"]}}
  /* eslint-enable */

});
