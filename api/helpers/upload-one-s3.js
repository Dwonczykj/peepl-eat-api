module.exports = {
  friendlyName: 'Upload One S3',

  description: 'Upload One Image to S3',

  inputs: {
    image: {
      type: 'ref',
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    const { v4: uuidv4 } = require('uuid');

    var inTestEnv =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;

    let imageInfo;
    if (!inTestEnv) {
      if(!inputs.image){
        return exits.success(undefined);
      }
      else if(typeof(inputs.image) === 'string'){
	      const verifiedImageDomain = sails.config.custom.storageDomainsRegExps
          .map((domain) => {
            var subDomain = /(.*)/;
            var flags = '';
            if(!(domain instanceof RegExp) && typeof(doamin) === 'string'){
              domain = RegExp(domain);
            }
            var urlPattern = new RegExp(
              domain.source + subDomain.source,
              flags
            );

            // regex3 is now /foobar/gy
            try {
              flags =
                domain.flags !== subDomain.flags
                  ? (domain.flags + subDomain.flags)
                      .split('')
                      .sort()
                      .join('')
                      .replace(/(.)(?=.*\1)/g, '')
                  : domain.flags;
            } catch (error) {
              sails.log.warn(`Unable to create regex flags of: "${flags}"`);
            }
            try {
              urlPattern = new RegExp(domain.source + subDomain.source, flags);
            } catch (error) {
              sails.log.warn(`Unable to use regex flags of: "${flags}"`);
            }
            const matches = inputs.image.match(urlPattern);
            if (matches && matches.length >= 2) {
              return matches[1];
            } else {
              return null;
            }
          })
          .filter((match) => {
            return match !== null;
          });
        if (verifiedImageDomain.length){
          imageInfo = {
            fd: verifiedImageDomain[0],
            ffd: inputs.image,
          };
          return exits.success(imageInfo);
        }
      }
      try {
        // ~ https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
        sails.log(
          `Uploading an image to s3 bucket: ${sails.config.custom.amazonS3Bucket}`
        );
        await sails.uploadOne(
          inputs.image, // : Buffer, Typed Array, Blob, String, ReadableStream
          {
            adapter: require('skipper-s3'),
            key: sails.config.custom.amazonS3AccessKey,
            secret: sails.config.custom.amazonS3Secret,
            bucket: sails.config.custom.amazonS3Bucket,
            maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
          },
          (err, filesUploaded) => {
            if (err) {
              sails.log.error(err);
            }
            // return res.ok({
            //   files: filesUploaded,
            //   textParams: req.allParams()
            // });
            imageInfo = filesUploaded;
            const imageInfoFileName = imageInfo && imageInfo.filename;
            if (!imageInfoFileName) {
              sails.log.error(
                `Error uploading image to s3-bucket: and no files uploaded!`
              );
            }
            imageInfo =
              imageInfo && imageInfo.fd
                ? {
                    ...imageInfo,
                    ffd: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
                  }
                : null;
            if (!imageInfo) {
              return exits.success(undefined);
            }
            const imageInfoStr = JSON.stringify(imageInfo);
            sails.log(`Image uploaded to bucket:\n${imageInfoStr}`);
            return exits.success(imageInfo);
          }
        );
        
        // .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
        // .intercept(
        //   (err) => new Error('The photo upload failed! ' + err.message)
        // );
        
      } catch (error) {
        sails.log.error(`Error uploading image to s3-bucket: ${error}`);
        return exits.success(undefined);
      }
    } else {
      imageInfo = {
        fd: inTestEnv ? 'test-image-fd-' + uuidv4() : null,
        ffd: null,
      };
      return exits.success(imageInfo);
    }
    
  },
};
