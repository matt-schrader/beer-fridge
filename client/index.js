import React from 'react'
import { render } from 'react-dom'

import io from 'socket.io-client'
import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'

const socket = io('http://localhost:3030');
const client = feathers();
client.configure(socketio(socket));

render(
  <h1>Beer Fridge!</h1>,
  document.getElementById('app')
)

const deviceService = client.service('device')
deviceService.on('patched', (device) => {
  render(<h1>{JSON.stringify(device)}</h1>, document.getElementById('app'))
})

module.hot.accept()
