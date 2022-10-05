/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/UserController.test.js
const _ = require('lodash');
const { expect } = require("chai");
var supertest = require("supertest");
var util = require("util");

require("ts-node/register");

const { callAuthActionWithCookie } = require("../../utils");


const cwd = process.cwd();
const actionsToTest = {
  'GET':[],
  'ALL': [],
  'POST':[],
  'PUT':[]
};

const reg = /\/:([^/]+)/;
const regFinalSlash = /\/$/;
const regAction = /\/([^/:?]+)$/;

const ids = {
  vendorId: 1,
  vendorid: 1,
  productId: 1,
  orderId: 1,
  deliveryPartnerId: 1,
  categoryGroupId: 1,
  outCode: "L1",
  discountCode: "DELI10",
};

const routes_read = require(cwd + "/config/routes.js")['routes'];
const policies = require(cwd + "/test/config/policies.js")['policies']; //!this checks that are polices were not updated incorrectly by forcing a dounle change to the test file.
const queryParamsTestConfig = require(cwd +
  "/test/config/queryParamsTestConfig.js")["policies"];
const policyPaths = Object.keys(policies);
const policyPathsRegx = Object.keys(policies).map(
  (pk) => new RegExp(pk.replace("*", ".*"), "g")
);
_.each(Object.keys(routes_read), function (route_key) {
  const theSplit = route_key.split(" ");
  const routeHttp = theSplit[0];
  const routePath = theSplit[1];
  const actionRelPath = routes_read[route_key]["action"];
  const actionPath = cwd + "/api/controllers/" + routes_read[route_key]["action"];
  if(!actionsToTest[routeHttp]){
    actionsToTest[routeHttp] = [];
  }
  var policyVar = true;
  for (var i = 0; i < policyPaths.length; i++){
    if(routes_read[route_key]["action"].match(policyPathsRegx[i])){
      policyVar = policies[policyPaths[i]];
      break;
    }
  }
  let mVar = '1';
  if(routePath.match(reg)){
    const m = routePath.match(reg)[1];
    if(!Object.keys(ids).includes(m)){
      console.warn(
        `Our hardcoded list of ids doesn't contain an id for: "${m}".\nSetting a default value of 1...`
      );
      ids[m] = 1;
    }
    mVar = ids[m];
  }
  const actionNames = routePath
    .replace(reg, "")
    .match(regAction);
  let actionName = '';
  if (!actionNames){
    console.warn(
      "Cannot match action name for route: " + routePath.replace(reg, "")
    );
  }else{
    actionName = actionNames[0];
  }
  
  actionsToTest[routeHttp].push({
    routeHttp: routeHttp,
    routePath: routePath.replace(reg, "?$1=" + mVar),
    actionPath: actionPath,
    actionName: actionName,
    actionRelPath: actionRelPath,
    // "action": require(actionPath),
    queryParams: queryParamsTestConfig || routePath.replace(reg, "?$1=" + mVar),
    policy: policyVar,
  });
});

// ~ https://www.chaijs.com/api/bdd/
// ~ https://mochajs.org/#using-async-await
// ~ https://mochajs.org/#asynchronous-code
describe("Fetch GET Routes from routes.js", async () => {
  for (const testObj of actionsToTest["GET"]) {
    describe(`${testObj["actionRelPath"]}() returns a 200 with json when authenticated`, () => {
      it(`${testObj["actionRelPath"]}() returns data`, async () => {
        const cb = async (cookie) => {
          if (testObj["actionName"].toLowerCase().includes('login')) {
            return;
          }
          try {
            console.info(`GET -> ${testObj["routePath"]}`);
            const response = await supertest(sails.hooks.http.app)
              .get(testObj["routePath"]) //TODO: Set the path parameters for GETS with params.
              .set("Cookie", cookie)
              .set("Accept", "application/json");
            
            expect(response.statusCode).to.equal(200);
            expect(response.body).not.to.have.property("data");
            
            console.info(
              `${testObj["routePath"]} -> ` +
                util.inspect(response.body, { depth: 0 }) + // * depth: null for full object print
                ""
            );
            return response;
          } catch (errs) {
            console.warn(errs);
            throw errs;
          }
        };
        await callAuthActionWithCookie(cb);
        return;
      });
    });
    // describe(`${testObj["actionRelPath"]}() returns a 403 when unAuthenticated`, () => {
    //   it(`${testObj["actionRelPath"]}() returns unauthorised unless policy == true`, async (done) => {
    //     const cb = async (cookie) =>
    //       supertest(sails.hooks.http.app)
    //         .set("Cookie", cookie)
    //         .set("Accept", "application/json")
    //         .get(testObj["routePath"]) //TODO: Set the path parameters for GETS with params.
    //         .expect(testObj["policy"] !== true ? 403 : 200)
    //         .then((response) => {
    //           console.log("StatusCode resonse was: " + response.statusCode);
    //           expect(response.statusCode).to.equal(
    //             testObj["policy"] !== true ? 403 : 200
    //           );
    //           expect(response.body).not.to.have.property("data");
    //           return response;
    //         })
    //         .catch((errs) => {
    //           console.warn(errs);
    //           throw errs;
    //         });
    //     // eslint-disable-next-line callback-return
    //     await cb();
    //   });
    // });
  }
});
