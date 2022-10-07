const dotenv = require("dotenv"); //.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config("./env").parsed;

module.exports = [
  {
    email: "service.account@example.com",
    phoneNoCountry: 9995557777,
    phoneCountryCode: 1,
    name: "SERVICE 1",
    isSuperAdmin: false,
    role: "deliveryPartner",
    deliveryPartnerRole: "deliveryManager",
    firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
  },
  {
    email: "test.service@example.com",
    phoneNoCountry: 9993137777,
    phoneCountryCode: 44,
    name: "TEST_SERVICE",
    isSuperAdmin: true,
    role: "admin",
    firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
    secret: envConfig["test_secret"],
  },
  {
    email: "joey@vegiapp.co.uk",
    // password: 'Testing123!',
    phoneNoCountry: 7905532512,
    phoneCountryCode: 44,
    name: "Joey Dwonczyk",
    vendor: 1,
    vendorConfirmed: true,
    isSuperAdmin: true,
    vendorRole: "none",
    role: "admin",
    firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
  },
  
];
