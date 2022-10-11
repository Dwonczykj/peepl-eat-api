const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");
const fs = require("fs");

describe(`Can upload a local image to amazon s3`, () => {
  // describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
  it("Upload succeeds", async () => {
    const testImage = process.cwd() + '/assets/images/roast-back.jpg';
    const imgStream = fs.createReadStream(testImage);
    var imageInfo = await sails
      .uploadOne(imgStream, {
        adapter: require("skipper-s3"),
        key: sails.config.custom.amazonS3AccessKey,
        secret: sails.config.custom.amazonS3Secret,
        bucket: sails.config.custom.amazonS3Bucket,
        maxBytes: 30000000,
      })
      .intercept("E_EXCEEDS_UPLOAD_LIMIT", "tooBig")
      .intercept((err) => new Error("The photo upload failed! " + err.message));
    var newProduct;
    if (!imageInfo) {
      // Create the new product
      newProduct = await Product.create({
        name: "S3 Image Testing 1",
        description: "",
        basePrice: 100,
        isAvailable: true,
        priority: 1,
        vendor: 1,
      }).fetch();
    } else {
      newProduct = await Product.create({
        imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
        name: "S3 Image Testing 1",
        description: "",
        basePrice: 100,
        isAvailable: true,
        priority: 1,
        vendor: 1,
      }).fetch();
    }
    
    // const imgStream = fs.createReadStream(testImage);
    // imgStream.on("end", () => req.end(done));
    // imgStream.pipe(req, { end: false });
  });
  // });
});
