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
	      const verifiedImageDomain = sails.config.custom.storageDomains.map(
          (domain) => {
            var subDomain = /(.*)/;
            var flags =
              domain.flags !== subDomain.flags
                ? (domain.flags + subDomain.flags)
                    .split('')
                    .sort()
                    .join('')
                    .replace(/(.)(?=.*\1)/, '')
                : domain.flags;
            var urlPattern = new RegExp(
              domain.source + subDomain.source,
              flags
            );
            const matches = inputs.image.match(urlPattern);
            if (matches && matches.length >= 2){
              return matches[1];
            } else {
              return null;
            }
          }
        ).filter((match) => {
          return match !== null;
        });
        if (verifiedImageDomain.length){
          imageInfo = {
            fd: verifiedImageDomain[0],
          };
          return exits.success(imageInfo);
        }
      }
      try {
	      imageInfo = await sails
	        .uploadOne(inputs.image, {
	          adapter: require('skipper-s3'),
	          key: sails.config.custom.amazonS3AccessKey,
	          secret: sails.config.custom.amazonS3Secret,
	          bucket: sails.config.custom.amazonS3Bucket,
	          maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
	        })
	        .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
	        .intercept(
	          (err) => new Error('The photo upload failed! ' + err.message)
	        );
      } catch (error) {
        sails.log.error(`Error uploading image to s3-bucket: ${error}`);
        return exits.success(undefined);
      }
      if(!imageInfo){
        return exits.success(undefined);
      }
    } else {
      imageInfo = {
        fd: inTestEnv ? 'test-image-fd-' + uuidv4() : null,
      };
    }
    return exits.success(imageInfo);
  },
};
