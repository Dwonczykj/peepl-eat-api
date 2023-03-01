import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';

const { fixtures } = require('../../../scripts/build_db');
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

declare var sails: sailsVegi;

describe("helpers.uploadOneS3", () => {
  it('can upload a file from local assets file system', async () => {
    
    var file: Buffer | null = null;
    console.log(__dirname);
    fs.readFile(__dirname + '/test_52kb.jpeg', async (err, data) => {
      if (err) {
        throw err;
      }
      data = file;
      // console.log(data.toString());
      const result = await sails.helpers.uploadOneS3(file);

      assert.isDefined(result);
      expect(result)
        .to.be.an('object')
        .that.includes.all.keys(['fd'] as Array<keyof typeof result>);

      expect(result.fd).to.equal('04adc49b-cd7e-4a00-b34b-9bcdf956abf9.upload');
    });

    return;
  });
  it("can upload a string url", async () => {
    const imageUri =
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/04adc49b-cd7e-4a00-b34b-9bcdf956abf9.upload';
    const result = await sails.helpers.uploadOneS3(imageUri);

    assert.isDefined(result);
    expect(result).to.be.an('object').that.includes.all.keys([
      'fd'
    ] as Array<keyof typeof result>);

    expect(result.fd).to.equal('04adc49b-cd7e-4a00-b34b-9bcdf956abf9.upload');

    return;
  });
});
