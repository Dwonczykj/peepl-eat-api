module.exports = {


  friendlyName: 'Initialise delivery methods',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
    },
    deliveryPartner: {
      type: 'number',
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // TODO: Do all this inside a transaction

    // Create FulfilmentMethods
    let delv;
    let col;

    // Add FulfilmentMethods to Vendor/DeliveryPartner
    if(inputs.vendor){
      delv = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'delivery'}).fetch();
      col = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'collection'}).fetch();

      await Vendor.updateOne(inputs.vendor).set({
        deliveryFulfilmentMethod: delv.id,
        collectionFulfilmentMethod: col.id
      });
    } else if (inputs.deliveryPartner){
      delv = await FulfilmentMethod.create({deliveryPartner:inputs.deliveryPartner, methodType:'delivery'}).fetch();

      await DeliveryPartner.updateOne(inputs.deliveryPartner).set({
        deliveryFulfilmentMethod: delv.id,
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
        fulfilmentMethod: delv.id
      });

      if(inputs.vendor){
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
    await FulfilmentMethod.addToCollection(delv.id, 'openingHours').members(newHoursIDsDel);

    if(inputs.vendor){
      const newHoursCol = await OpeningHours.createEach(openingHoursCol).fetch();
      const newHoursIDsCol = newHoursCol.map(({ id }) => id);
      await FulfilmentMethod.addToCollection(col.id, 'openingHours').members(newHoursIDsCol);
    }

    return exits.success();
  }


};

