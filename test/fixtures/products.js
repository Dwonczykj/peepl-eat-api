module.exports = [
  {
    id: 1,
    name: "Coffee",
    description: "A cup of coffee",
    shortDescription: "Coffee Drink",
    basePrice: 300,
    imageUrl: "",
    isAvailable: true,
    priority: 0,
    isFeatured: false,
    status: "active",
    vendor: 1, //delifonseca
    options: [13, 14],
    category: 2, //coffee
  },
  {
    id: 2,
    name: "Burns Night - Dine @ Home (For 1)",
    description:
      "Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we've made our Dine@home Burns inspired instead.",
    basePrice: 2200,
    isAvailable: true,
    // priority: 0,
    // isFeatured: false,
    vendor: 1, //delifonseca
    categoryGroup: 11,
    imageUrl:
      "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
    category: 4, // dinner
  },
];