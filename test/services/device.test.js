const app = require('../../src/app');

describe('\'device\' service', () => {
  it('registered the service', () => {
    const service = app.service('device');
    expect(service).toBeTruthy();
  });
});
