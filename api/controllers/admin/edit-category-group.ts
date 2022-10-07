var CategoryGroup: any;

module.exports = {


    friendlyName: 'Edit category group',


    description: '',


    inputs: {
        id: {
            type: 'number',
            required: true,
            description: 'The id of the category group to edit'
        },
        name: {
            type: 'string',
            required: true,
            description: 'The name of the category group',
            maxLength: 50
        },
        forRestaurantItem: {
            type: 'boolean',
            required: true,
            description: 'Whether the category applies to product categories for restaurants or grocers',
        },
        image: {
            type: 'ref',
        },
    },


    exits: {
        success: {
            description: 'category group edited.'
        },
        notFound: {
            description: 'There is no category group with that ID!',
            responseType: 'notFound'
        },
        unauthorised: {
            description: 'You are not authorised to edit this vendor.',
            responseType: 'unauthorised'
        },
    },


    fn: async function (inputs, exits) {
        // Find the category group to edit
        var categoryGroup = await CategoryGroup.findOne({
            id: inputs.id
        });

        if (!categoryGroup) {
            return exits.notFound();
        }

        if (inputs.image) {
            var imageInfo = await sails.uploadOne(inputs.image, {
                adapter: require('skipper-s3'),
                key: sails.config.custom.amazonS3AccessKey,
                secret: sails.config.custom.amazonS3Secret,
                bucket: sails.config.custom.amazonS3Bucket,
                maxBytes: 30000000
            })
                .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
                .intercept((err) => new Error('The photo upload failed! ' + err.message));

            if (imageInfo) {
                inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
            }
        }

        delete inputs.image;

        // Update the category group
        await CategoryGroup.updateOne({
            id: inputs.id
        }).set({
            name: inputs.name,
            forRestaurantItem: inputs.forRestaurantItem,
            imageUrl: inputs.imageUrl,
        });

        // Return the updated category group
        // All done.
        return categoryGroup;

    }


};
