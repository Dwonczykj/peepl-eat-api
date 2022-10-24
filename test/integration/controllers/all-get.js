const _ = require('lodash');

require('ts-node/register');

const { getNextWeekday } = require('../../utils');

const cwd = process.cwd();
const actionsToTest = {
  GET: [],
  ALL: [],
  POST: [],
  PUT: [],
};

const reg = /\/:([^/]+)/;
const regFinalSlash = /\/$/;
const regAction = /\/([^/:?]+)$/;

const ids = {
  vendorId: 1,
  vendorid: 1,
  vendor: 1,
  date: getNextWeekday('thursday'),
  productId: 1,
  orderId: 1,
  deliveryPartnerId: 1,
  categoryGroupId: 1,
  outCode: 'L1',
  discountCode: 'DELI10',
};

const GET_ROUTE_PARAMS = {
  'vendors/get-fulfilment-slots': {
    params: {
      vendor: 1,
      date: getNextWeekday('thursday'),
    },
    statusCode: 200,
  },
  'admin/logout': {
    params: {},
    statusCode: 302,
  },
};

const IGNORE_ROUTES = ['admin/view-order'];

const routesRead = require(cwd + '/config/routes.js')['routes'];
const policies = require(cwd + '/test/config/policies.js')['policies']; //!this checks that are polices were not updated incorrectly by forcing a dounle change to the test file.
const queryParamsTestConfig = require(cwd +
  '/test/config/queryParamsTestConfig.js')['policies'];
const policyPaths = Object.keys(policies);
const policyPathsRegx = Object.keys(policies).map(
  (pk) => new RegExp(pk.replace('*', '.*'), 'g')
);
_.each(Object.keys(routesRead), (route_key) => {
  const theSplit = route_key.split(' ');
  const routeHttp = theSplit[0];
  const routePath = theSplit[1];
  const actionRelPath = routesRead[route_key]['action'];
  const actionPath =
    cwd + '/api/controllers/' + routesRead[route_key]['action'];
  if (!actionsToTest[routeHttp]) {
    actionsToTest[routeHttp] = [];
  }
  var policyVar = true;
  for (var i = 0; i < policyPaths.length; i++) {
    if (routesRead[route_key]['action'].match(policyPathsRegx[i])) {
      policyVar = policies[policyPaths[i]];
      break;
    }
  }
  let mVar = '1';
  if (routePath.match(reg)) {
    const m = routePath.match(reg)[1];
    if (!Object.keys(ids).includes(m)) {
      console.warn(
        `Our hardcoded list of ids doesn't contain an id for: "${m}".\nSetting a default value of 1...`
      );
      ids[m] = 1;
    }
    mVar = ids[m];
  }
  const actionNames = routePath.replace(reg, '').match(regAction);
  let actionName = '';
  if (!actionNames) {
    console.warn(
      'Cannot match action name for route: ' + routePath.replace(reg, '')
    );
  } else {
    actionName = actionNames[0];
  }
  let routeParams = {};
  if (GET_ROUTE_PARAMS[actionRelPath]) {
    routeParams = GET_ROUTE_PARAMS[actionRelPath];
  } else {
    try {
      const { inputs } = require(actionPath);
      if (inputs && Object.keys(inputs).length > 0) {
        // route requires params
        for (var key of Object.keys(inputs)) {
          routeParams[key] = ''; //todo set correctly
        }
      }
    } catch (error) {
      //ignore
    }
  }

  if (IGNORE_ROUTES.indexOf(actionRelPath) > -1) {
    console.log(
      `removed checking of ${actionName} route as already tested and requires more setup to use`
    );
  } else if (Object.keys(routeParams).length === 0) {
    actionsToTest[routeHttp].push({
      routeHttp: routeHttp,
      routePathNoQry: routePath,
      routePath: routePath.replace(reg, '?$1=' + mVar),
      actionPath: actionPath,
      actionName: actionName,
      actionRelPath: actionRelPath,
      // "action": require(actionPath),
      routeParams: routeParams,
      queryParams:
        queryParamsTestConfig || routePath.replace(reg, '?$1=' + mVar),
      policy: policyVar,
    });
  } else {
    console.log(`removed checking of ${actionName} route as has query params`);
  }
});
