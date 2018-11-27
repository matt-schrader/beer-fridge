# beer-fridge

> A self hosted app to control beer brewing equipment at home.

## About

This application supports the data model for Beer Fridge infrastructure.  Current features:
1. Accepts messages from one or many temperature controlling devices.  These messages include the current power state and temperature of the device.
2. Find simple keezer sketch in BeerFridgeSimple folder which will can run on NodeMCU (Arduino board with wifi)
3. Accepts updating target temperature

## Getting Started

The server can be run directly, or inside of a docker container.

# Run directly
1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/beer-fridge; npm install
    ```

3. Start your app

    ```
    npm start
    ```

# Run in docker
1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Build the image
    ```
    cd path/to/beer-fridge; npm run docker-build
    ```
3. Run the container
    ```
    cd path/to/beer-fridge; npm run docker-run
    ```

There is a client implementation in the beer-fridge-client repository which supports live updates and configuring devices.

Custom devices are easily supported.  It can send updates as frequently as necessary in the form
```
POST http://<server-host>:3030/messages
{
    id: '<UNIQUE_ID>',
    version: 0, // this is the current version of the device and will support receiving updates if device is out of sync, keep track of version or send zero to always receive updates
    temp: 6.6, // temperature in celcius
    state: 'ON' // ON OR OFF string
}
```

Response will be in the following format:
```
{
    version: 7,
    hostname: '', // user configured name of device.  The BeerFridgeSimple sketch uses this to configure the dns of the arduino device.
    targetTemperature: 6.6, // Set point for temperature the device should be held at
}
```

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
