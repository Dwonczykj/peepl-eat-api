module.exports = {


  friendlyName: 'Initialise delivery methods',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
      required: true
    },
    type:{
      type: 'string',
      isIn: ['deliveryPartner', 'vendor'],
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    // TODO: Do all this inside a transaction

    // Create FulfilmentMethods
    const del = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'delivery'}).fetch();
    var col;
    if(inputs.type === 'vendor'){
      col = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'collection'}).fetch();
    }

    // Add FulfilmentMethods to Vendor/DeliveryPartner
    if(inputs.type === 'vendor'){
      await Vendor.updateOne(inputs.vendor).set({
        deliveryFulfilmentMethod: del.id,
        collectionFulfilmentMethod: col.id
      });
    } else if (inputs.type === 'deliveryPartner'){
      await DeliveryPartner.updateOne(inputs.vendor).set({
        deliveryFulfilmentMethod: del.id,
      });
    }

    // Generate collection/delivery blank opening hours
    var openingHoursDel = [];
    var openingHoursCol= [];
    var weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Create blank opening hours for each day
    weekdays.forEach((weekday) => {
      // Delivery hours
      openingHoursDel.push({
        dayOfWeek: weekday,
        isOpen: false,
        openTime: '09:00',
        closeTime: '17:00',
        fulfilmentMethod: del.id
      });

      if(inputs.type === 'vendor'){
        // Collection hours
        openingHoursCol.push({
          dayOfWeek: weekday,
          isOpen: false,
          openTime: '09:00',
          closeTime: '17:00',
          fulfilmentMethod: col.id
        });
      }
    });

    // Add the opening hours to the database
    const newHoursDel = await OpeningHours.createEach(openingHoursDel).fetch();
    const newHoursIDsDel = newHoursDel.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(del.id, 'openingHours').members(newHoursIDsDel);

    if(inputs.type === 'vendor'){
      const newHoursCol = await OpeningHours.createEach(openingHoursCol).fetch();
      const newHoursIDsCol = newHoursCol.map(({ id }) => id);
      await FulfilmentMethod.addToCollection(col.id, 'openingHours').members(newHoursIDsCol);
    }

    return;
  }


};

