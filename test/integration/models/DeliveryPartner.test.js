const {expect, assert} = require('chai');
const exp = require('constants');


describe(`Can create 1 delivery partner`, () => {
  it("Should not initialise new Delivery Methods when deliveryFulfilmentMethod set" , async () => {
    let deliveryPartner;
    try {
      deliveryPartner = await DeliveryPartner.create({
        name: "Test Delivery Partner XX",
        email: "dp@sailshelpers.com",
        phoneNumber: "012111123",
        status: "active",
        deliversToPostCodes: ["L1"],
        walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        rating: 5,
        deliveryFulfilmentMethod: 105,
      }).fetch();
    } catch (error) {
      console.warn(error);
      throw error;
    }
    assert.isDefined(deliveryPartner);
    deliveryPartner = await DeliveryPartner.findOne(
      deliveryPartner.id
    ).populate("deliveryFulfilmentMethod");
    assert.isDefined(deliveryPartner.deliveryFulfilmentMethod);
    assert.isNotNull(deliveryPartner.deliveryFulfilmentMethod);
    expect(deliveryPartner.deliveryFulfilmentMethod.id).to.equal(105);
  });
  it("Should initialise new Delivery Methods when deliveryFulfilmentMethod not set" , async () => {
    let deliveryPartner;
    try {
      deliveryPartner = await DeliveryPartner.create({
        name: "Test DP No FM SET",
        email: "dp@sailshelpers.com",
        phoneNumber: "012111123",
        status: "active",
        deliversToPostCodes: ["L1"],
        walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        rating: 5,
      }).fetch();
    } catch (error) {
      console.warn(error);
      throw error;
    }
    assert.isDefined(deliveryPartner);
    deliveryPartner = await DeliveryPartner.findOne(
      deliveryPartner.id
    ).populate("deliveryFulfilmentMethod");
    assert.isDefined(deliveryPartner.deliveryFulfilmentMethod);
    assert.isNotNull(deliveryPartner.deliveryFulfilmentMethod);
    expect(deliveryPartner.deliveryFulfilmentMethod.id).to.be.greaterThan(0);
  });
});
