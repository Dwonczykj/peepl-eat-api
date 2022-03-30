module.exports = {


  friendlyName: 'Initialise delivery methods',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
      required: true
    },
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
    const col = await FulfilmentMethod.create({vendor:inputs.vendor, methodType:'collection'}).fetch();

    // Add FulfilmentMethods to Vendor
    await Vendor.updateOne(inputs.vendor).set({
      deliveryFulfilmentMethod: del.id,
      collectionFulfilmentMethod: col.id
    });

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
        fulfilmentMethod: del.id
      });

      // Collection hours
      openingHoursCol.push({
        dayOfWeek: weekday,
        isOpen: false,
        fulfilmentMethod: col.id
      });
    });

    // Add the opening hours to the database
    const newHoursDel = await OpeningHours.createEach(openingHoursDel).fetch();
    const newHoursIDsDel = newHoursDel.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(del.id, 'openingHours').members(newHoursIDsDel);

    const newHoursCol = await OpeningHours.createEach(openingHoursCol).fetch();
    const newHoursIDsCol = newHoursCol.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(col.id, 'openingHours').members(newHoursIDsCol);
    
    return;
  }


};

