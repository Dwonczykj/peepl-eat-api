const { expect, assert } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
var supertest = require('supertest');
const { callAuthActionWithCookie } = require('../../../utils');
var util = require('util');
require('ts-node/register');
const fs = require('fs');

describe(`Amazon S3 Bucket Uploads`, () => {
  it('amazon s3 Image Upload succeeds', async () => {
    const testImage = process.cwd() + '/test/assets/images/roast-back.jpg';
    const imgStream = fs.createReadStream(testImage);
    // imgStream.pipe(req, { end: false });
    imgStream.on('end', () => {
      console.info('Test image finished uploading to amazon s3.');
    });
    var imageInfo;
    try {
      imageInfo = await sails
        .uploadOne(imgStream, {
          adapter: require('skipper-s3'),
          key: sails.config.custom.amazonS3AccessKey,
          secret: sails.config.custom.amazonS3Secret,
          bucket: sails.config.custom.amazonS3Bucket,
          maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
        })
        .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig');
    } catch (error) {
      console.error(new Error('The photo upload failed! ' + error.message));
      throw error;
    }
    var newProduct;
    expect(imageInfo).to.have.property('fd');
    assert.isNotEmpty(imageInfo.fd);
    expect(imageInfo).to.have.property('name');
    assert.isNotEmpty(imageInfo.name);
    // console.log(
    //   `image info returned from s3 bucket: ${util.inspect(imageInfo, {
    //     depth: 2,
    //   })}`
    // );
    newProduct = await Product.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: 'S3 Image Testing 1',
      description: '',
      basePrice: 100,
      isAvailable: true,
      priority: 1,
      vendor: 1,
    }).fetch();
  });
});
