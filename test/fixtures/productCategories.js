const vendorCategories = require('./vendorCategories');

module.exports = function () {
  return [
    {
      id: 1,
      name: 'Lunch',
      vendor: 1,
      categoryGroup: 11, // vendorCategories[10].id,
    },
    {
      id: 2,
      name: 'Coffee',
      vendor: 1,
      categoryGroup: 23, // vendorCategories[22].id,
    },
    {
      id: 3,
      name: 'Desert',
      vendor: 1,
      categoryGroup: 11, // vendorCategories[10].id,
    },
    {
      id: 4,
      name: 'Dinner',
      vendor: 1,
      categoryGroup: 11, // vendorCategories[10].id,
    },
    {
      id: 5,
      name: 'Bakery',
      vendor: 1,
      categoryGroup: 11, // vendorCategories[10].id,
    },
    {
      id: 6,
      name: 'Free-from',
      vendor: 1,
      categoryGroup: 11, // vendorCategories[10].id,
    },
  ];
};
