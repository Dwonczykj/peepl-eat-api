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
  methods: {"downloadImage":{"verb":"GET","url":"/products/download-image/:productId","args":["productId"]},"checkDiscountCode":{"verb":"GET","url":"/api/v1/discounts/check-discount-code/:discountCode","args":["discountCode"]},"getProductOptions":{"verb":"GET","url":"/api/v1/products/get-product-options/:productId","args":["productId"]},"getProductDeliveryMethods":{"verb":"POST","url":"/api/v1/products/get-product-delivery-methods","args":["productids"]},"subscribeToOrder":{"verb":"GET","url":"/api/v1/orders/subscribe-to-order/:orderId","args":["orderId"],"protocol":"io.socket"},"createOrder":{"verb":"POST","url":"/api/v1/orders/create-order","args":["items","address","total","marketingOptIn","discountCode"]},"paymentSubmitted":{"verb":"POST","url":"/api/v1/orders/payment-submitted","args":["orderId","jobId"]},"createVendor":{"verb":"POST","url":"/api/v1/admin/create-vendor","args":["name","description","type","image","walletId","phoneNumber","deliveryRestrictionDetails","status"]},"editVendor":{"verb":"POST","url":"/api/v1/admin/edit-vendor","args":["id","name","description","image","walletId","phoneNumber","deliveryRestrictionDetails","status"]},"editProduct":{"verb":"POST","url":"/api/v1/admin/edit-product","args":["id","name","description","basePrice","image","isAvailable","priority"]},"createProduct":{"verb":"POST","url":"/api/v1/admin/create-product","args":["name","description","basePrice","image","isAvailable","priority","vendor"]},"createProductOption":{"verb":"POST","url":"/api/v1/admin/create-product-option","args":["name","product"]},"editProductOption":{"verb":"POST","url":"/api/v1/admin/edit-product-option","args":["id","name"]},"createProductOptionValue":{"verb":"POST","url":"/api/v1/admin/create-product-option-value","args":["name","description","priceModifier","isAvailable","productOption"]},"editProductOptionValue":{"verb":"POST","url":"/api/v1/admin/edit-product-option-value","args":["id","name","description","priceModifier","isAvailable"]},"archiveOrder":{"verb":"POST","url":"/api/v1/admin/archive-order","args":["orderId"]},"updateProductStatus":{"verb":"POST","url":"/api/v1/admin/update-product-status","args":["productIds","isAvailable"]},"createDiscount":{"verb":"POST","url":"/api/v1/admin/create-discount","args":["code","percentage","expiryDateTime","maxUses","isEnabled"]},"editDiscount":{"verb":"POST","url":"/api/v1/admin/edit-discount","args":["id","code","percentage","expiryDateTime","maxUses","isEnabled"]}}
  /* eslint-enable */

});
