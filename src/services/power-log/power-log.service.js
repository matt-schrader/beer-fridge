// Initializes the `powerLog` service on path `/power-log`
const createService = require('feathers-nedb');
const createModel = require('../../models/power-log.model');
const hooks = require('./power-log.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/power-log', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('power-log');

  service.hooks(hooks);
};
