// Initializes the `device` service on path `/device`
const createService = require('feathers-nedb');
const createModel = require('../../models/device.model');
const hooks = require('./device.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/device', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('device');

  service.hooks(hooks);
};
