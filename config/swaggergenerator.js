module.exports['swagger-generator'] = {
  disabled: false,
  swaggerJsonPath: './swagger/swagger.json',
  swagger: {
    openapi: '3.0.0',
    info: {
      title: 'Vegi Backend',
      description: 'This is a generated swagger json for the Vegi backend API.',
      contact: {name: 'Adam Galloway', url: 'http://github.com/theadamgalloway', email: 'adam@itsaboutpeepl.com'},
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:1337/' }
    ],
  },
  defaults: {
    responses: {
      '200': { description: 'The requested resource' },
      '404': { description: 'Resource not found' },
      '500': { description: 'Internal server error' }
    }
  },
};
