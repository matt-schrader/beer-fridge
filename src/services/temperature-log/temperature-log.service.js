// Initializes the `temperatureLog` service on path `/temperature-log`
const createService = require('feathers-nedb');
const createModel = require('../../models/temperature-log.model');
const hooks = require('./temperature-log.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/temperature-log', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('temperature-log');

  service.hooks(hooks);
};
