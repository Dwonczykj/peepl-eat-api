

module.exports = {
    friendlyName: 'Create or Update Opening Hours',

    inputs: {
        vendorID: {
            type: 'number',
            required: true
        },

        type: {
            type: 'string',
            isIn: ['collection', 'delivery']
        },

        openinghours: {
            type: 'json',
            columnType: 'array'
        }
    },

    exits: {
        success: {
            outputDescription: 'The updated opening hours',
            outputExample: {}
          }
    },

    fn: async function (inputs, exits) {
        const vendor = await Vendor.findOne({id: inputs.vendorID}).populate('collectionFulfillmentMethod');
        if (inputs.type == 'collection') {
            if (vendor.collectionFulfilmentMethod){
                inputs.openinghours.forEach(async hours => {await OpeningHours.updateOne(hours.id).set(hours)})
                return exits.success("yay");
            } else {
                const newHours = await OpeningHours.createEach(inputs.openinghours).fetch();
                const newHoursIDs = newHours.map(({ id }) => id);
                await FulfilmentMethod.addToCollection(vendor.collectionFulfilmentMethod, 'openingHours').members(newHoursIDs);
                return exits.success(newHours);
            }
        } else {
            if (vendor.deliveryFulfilmentMethod.openingHours){
                inputs.openinghours.forEach(async hours => {const newHours = await OpeningHours.updateOne(hours.id).set(hours).fetch()})
            } else {
                const newHours = await OpeningHours.createEach(inputs.openinghours).fetch();
                const newHoursIDs = newHours.map(({ id }) => id);
                await FulfilmentMethod.addToCollection(vendor.deliveryFulfilmentMethod, 'openingHours').members(newHoursIDs);
                return exits.success(newHours);
            }
        }

    }
}