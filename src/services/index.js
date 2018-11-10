const messages = require('./messages/messages.service.js');
const device = require('./device/device.service.js');
const temperatureLog = require('./temperature-log/temperature-log.service.js');
const powerLog = require('./power-log/power-log.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(messages);
  app.configure(device);
  app.configure(temperatureLog);
  app.configure(powerLog);
};
