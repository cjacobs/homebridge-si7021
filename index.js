const Si7021 = require('si7021-sensor')

var Accessory, Service, Characteristic, UUIDGen

module.exports = function (homebridge) {
    console.log("homebridge API version: " + homebridge.version);

    // Accessory must be created from PlatformAccessory Constructor
    // Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerAccessory("homebridge-si7021", "Humidity and Temperature Sensor", Si7021Platform);
}

// Accessory c'tor
class Si7021Platform {
    constructor(log, config) {
        this.log = log
        this.name = config.name
        this.pin = config.pin
        this.currentTemperatureC = 0
        this.currentHumidity = 0
        this.sensor = new Si7021()
    }

    identify(callback) {
        this.log('Identify')
        callback(null)
    }

    startReadLoop() {
        const callback = () => {
            setTimeout(() => this.readData(callback), 5000)
        }

        this.readData(callback)
    }

    readData(callback) {
        this.sensor.readSensorData().then((data) => {
            this.currentHumidity = data.humidity
            this.currentTemperatureC = data.temperature_C
        }).catch((err) => {
            this.log(`Error reading data: ${err}`)
        });
    }

    getServices() {
        const informationService = new Service.AccessoryInformation();
    
        informationService
          .setCharacteristic(Characteristic.Manufacturer, '???')
          .setCharacteristic(Characteristic.Model, 'si7021 Temperature and Humidity Sensor')
          .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');
    
        // Set up the service
        this.service = new Service.HumiditySensor(this.name);
        this.service
          .getCharacteristic(Characteristic.CurrentHumidity)
          .on('get', (callback) => {
            callback(null, this.currentHumidity);
          });
        this.service
          .getCharacteristic(Characteristic.CurrentTemperatureC)
          .on('get', (callback) => {
            callback(null, this.currentTemperatureC);
          });
        this.service
          .getCharacteristic(Characteristic.Name)
          .on('get', callback => {
            callback(null, this.name);
          });

        // Begin reading info
        this.startReadLoop();
    
        return [informationService, this.service];
      }
}
