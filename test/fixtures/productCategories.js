const vendorCategories = require('./vendorCategories');

module.exports = [
  {
    id: 1, //TODO: See if this is allowed?
    name: "Lunch",
    vendor: 1,
    categoryGroup: 11, // vendorCategories[10].id,
  },
  {
    id: 2,
    name: "Coffee",
    vendor: 1,
    categoryGroup: 23, // vendorCategories[22].id,
  },
  {
    id: 3,
    name: "Dinner",
    vendor: 1,
    categoryGroup: 11, // vendorCategories[10].id,
  },
];