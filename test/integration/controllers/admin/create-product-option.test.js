/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "create-product-option";
const ACTION_PATH = "admin";

describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new product option that has isRequired default to false", async () => {
      const EXPECTED_RESPONSE = {
        name: "Test product",
        isRequired: false,
        values: [],
        product: 64,
      };
      // const cb = async (cookie) => {
      //   var responseProduct;
      //   try {
      //     // responseProduct = await supertest(sails.hooks.http.app)
      //     //   .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
      //     //   .send({
      //     //     name: "Test product - create-product-option",
      //     //     description: "This is a test.",
      //     //     basePrice: 100,
      //     //     isAvailable: "false",
      //     //     isFeatured: "false",
      //     //     vendor: 11,
      //     //     category: 1,
      //     //   })
      //     //   .set("Cookie", cookie)
      //     //   .set("Accept", "application/json");
      //     // expect(responseProduct.statusCode).to.equal(200);
          
      //   } catch (errs) {
      //     console.warn(errs);
      //     throw errs;
      //   }
      // };
      
      // var newProduct = await Product.findOne({
      //   name: "Test product - create-product-option",
      // });
      // await callAuthActionWithCookie(cb);
      const newProdName = "Test product - create-product-option";
      var newProduct = await Product.create({
        name: newProdName,
        description:
          "Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we've made our Dine@home Burns inspired instead.",
        basePrice: 2200,
        isAvailable: true,
        // priority: 0,
        // isFeatured: false,
        vendor: 1, //delifonseca
        categoryGroup: 11,
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        category: 4,
      }).fetch();
      console.log("Created " + newProdName);
      const cb2 = async (cookie) => {
        try {
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({ name: newProdName, values: [], product: newProduct.id })
            .set("Cookie", cookie)
            .set("Accept", "application/json");
          expect(response.statusCode).to.equal(200);
          for (prop of Object.keys(EXPECTED_RESPONSE)) {
            expect(response.body).to.have.property(prop);
          }
          expect(response.body).to.deep.equal(EXPECTED_RESPONSE);
        } catch (errs) {
          console.warn(errs);
          throw errs;
        }
      };
      await callAuthActionWithCookie(cb2);
    });
    //TODO: Renable test below
    // it("Returns a new product option that has isRequired set to true", async () => {
    //   const EXPECTED_RESPONSE = {
    //     name: "Test required product",
    //     isRequired: true,
    //     values: [],
    //     product: 64,
    //   };
    //   const cb = async (cookie) => {
    //     try {
    //       const response = await supertest(sails.hooks.http.app)
    //         .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
    //         .send({ name: "testing", values: [], product: 64, isRequired: true })
    //         .set("Cookie", cookie)
    //         .set("Accept", "application/json");
    //       expect(response.statusCode).to.equal(200);
    //       for (prop of Object.keys(EXPECTED_RESPONSE)) {
    //         expect(response.body).to.have.property(prop);
    //       }
    //       expect(response.body).to.deep.equal(EXPECTED_RESPONSE);
    //     } catch (errs) {
    //       console.warn(errs);
    //       throw errs;
    //     }
    //   };
    //   await callAuthActionWithCookie(cb);
    // });
  });
});
