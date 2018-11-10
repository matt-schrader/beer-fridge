// Initializes the `messages` service on path `/messages`
//const createService = require('feathers-nedb');
const createModel = require('../../models/messages.model');
const hooks = require('./messages.hooks');
const moment = require('moment')

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  const messageService = {
    async create(data, params) {
      if (data.id) {
        var deviceService = app.service('device')
        var search = await deviceService.find({ query: { id: data.id }})
        let device
        if (!search.data.length) {
          const newDevice = { id: data.id }
          device = await deviceService.create(newDevice)
        } else if (search.data.length === 1) {
          device = search.data[0]
        } else {
          Promise.reject('Found more than one device matching the request!')
        }
        console.log('device', device)

        const logTime = moment.utc()
        if (data.temp) {
          var tempService = app.service('temperature-log')
          var temperatureLog = {
            deviceId: data.id,
            temperature: data.temp,
            time: logTime
          }
          await tempService.create(temperatureLog)
          await deviceService.patch(device._id, { currentTemperature: data.temp })
        }

        if (data.state) {
          var powerService = app.service('power-log')
          var powerLog = {
            deviceId: data.id,
            state: data.state,
            time: logTime
          }
          await powerService.create(powerLog)
          await deviceService.patch(device._id, { currentState: data.state })
        }
        return Promise.resolve({ status: 'Ok'})
      }
      return Promise.reject("Invalid object")
    },
  }

  // Initialize our service with any options it requires
  // app.use('/messages', createService(options));
  app.use('/messages', messageService)

  // Get our initialized service so that we can register hooks
  const service = app.service('messages');

  service.hooks(hooks);
};
