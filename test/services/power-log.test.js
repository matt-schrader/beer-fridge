const app = require('../../src/app');

describe('\'powerLog\' service', () => {
  it('registered the service', () => {
    const service = app.service('power-log');
    expect(service).toBeTruthy();
  });
});
