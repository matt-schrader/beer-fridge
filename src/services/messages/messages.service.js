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
    async create(data, _params) {
      if (data.id) {
        var deviceService = app.service('device')
        var search = await deviceService.find({ query: { id: data.id }})
        let device
        if (!search.length) {
          const newDevice = { id: data.id }
          device = await deviceService.create(newDevice)
        } else if (search.length === 1) {
          device = search[0]
        } else {
          Promise.reject('Found more than one device matching the request!')
        }

        const logTime = moment.utc().format()
        await deviceService.patch(device._id, { lastEventTime: logTime })

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

        const resultPacket = { status: 'Ok' }
        if (data.version && data.version < device.version) {
          resultPacket.version = device.version;
          if (device.name) {
            resultPacket.hostname = device.name.toLowerCase().split(' ').join('_')
          }

          if (device.targetTemperature) {
            resultPacket.targetTemperature = device.targetTemperature
          }
        }
        return Promise.resolve(resultPacket)
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
