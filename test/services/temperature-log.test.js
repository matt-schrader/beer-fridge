const app = require('../../src/app');

describe('\'temperatureLog\' service', () => {
  it('registered the service', () => {
    const service = app.service('temperature-log');
    expect(service).toBeTruthy();
  });
});
