/**
 * log-call
 * @description :: Policy that logs requests.
 */

/*
* req objects look like:
{
  method: 'GET',
  url: '/api/users',
  headers: {
    host: 'localhost:3000',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
    accept: 'application/json',
    // other headers...
  },
  params: {
    id: '123',
  },
  query: {
    sortBy: 'name',
    limit: '10',
  },
  body: {
    name: 'John Doe',
    email: 'johndoe@example.com',
    // other request body properties...
  },
  // other properties and methods...
}
*/
module.exports = async function (req, res, proceed) {
  if (req && (req.method === 'POST' || req.method === 'PUT') && req.body) {
    sails.log.verbose(
      `REQUEST [${req.method}]: "${req.url}" body: ${JSON.stringify(req.body)}`
    );
  } else {
    sails.log.verbose(`REQUEST [${req.method}]: "${req.url}"`);
  }
  return proceed();
};

